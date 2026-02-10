import { Buffer } from 'node:buffer'
import { type TeltonikaAvlData, type TeltonikaRecord } from './types'

export class TeltonikaParser {
	private buffer: Buffer
	private offset: number = 0
	public isImei: boolean = false
	public consumed: number = 0

	constructor(buffer: Buffer) {
		this.buffer = buffer
		this.isImei = this.checkIsImei()
	}

	private checkIsImei(): boolean {
		// Valid AVL data (in TCP VL) starts with 4 zero bytes (Preamble)
		// Only check if we have at least 4 bytes.
		if (this.buffer.length < 4) return true

		// If the first 4 bytes are 0, it's a Codec 8/8E TCP packet
		const preamble = this.buffer.readUInt32BE(0)
		return preamble !== 0
	}

	public getAvl(): TeltonikaAvlData {
		if (this.isImei) {
			throw new Error('Buffer contains IMEI or unknown data, not AVL records')
		}

		this.offset = 0

		// 1. Preamble (4 bytes)
		const preamble = this.buffer.readUInt32BE(this.offset)
		this.offset += 4

		if (preamble !== 0) {
			throw new Error('Invalid preamble: expected 0x00000000')
		}

		// 2. Data Length (4 bytes)
		const dataLength = this.buffer.readUInt32BE(this.offset)
		this.offset += 4

		const expectedEnd = this.offset + dataLength
		if (this.buffer.length < expectedEnd) {
			throw new Error(`Buffer too short: expected at least ${expectedEnd} bytes, got ${this.buffer.length}`)
		}

		// 3. Codec ID (1 byte)
		const codecId = this.buffer.readUInt8(this.offset)
		this.offset += 1

		// 4. Number of Data 1 (1 byte)
		const numberOfData1 = this.buffer.readUInt8(this.offset)
		this.offset += 1

		const records: TeltonikaRecord[] = []
		const isExtended = codecId === 0x8e // Codec 8 Extended

		for (let i = 0; i < numberOfData1; i++) {
			records.push(this.parseRecord(isExtended))
		}

		// 5. Number of Data 2 (1 byte)
		const numberOfData2 = this.buffer.readUInt8(this.offset)
		this.offset += 1

		if (numberOfData1 !== numberOfData2) {
			// This is just a warning in some implementations, but strictly should match
			// We'll proceed but it's worth noting.
		}

		// 6. CRC (4 bytes) - strictly adhering to packet structure
		// The CRC usually follows the data. The dataLength covers from CodecID to NumberOfData2.
		// So CRC is at expectedEnd.
		// We'll just skip checking CRC for now to be performance-first/lenient,
		// but we must advance 'consumed' correctly.
		// The CRC is 4 bytes.
		this.consumed = expectedEnd + 4

		return {
			codec_id: codecId,
			number_of_data: numberOfData1,
			records,
		}
	}

	private parseRecord(isExtended: boolean): TeltonikaRecord {
		// Timestamp (8 bytes, ms since epoch)
		// We use readBigUInt64BE because strictly timestamp is unsigned,
		// though readBigInt64BE works for reasonable dates.
		const timestampMs = this.buffer.readBigUInt64BE(this.offset)
		this.offset += 8
		const timestamp = new Date(Number(timestampMs))

		// Priority (1 byte)
		const priority = this.buffer.readUInt8(this.offset)
		this.offset += 1

		// GPS Element
		const longitude = this.readCoordinate() // 4 bytes
		const latitude = this.readCoordinate() // 4 bytes
		const altitude = this.buffer.readInt16BE(this.offset) // 2 bytes
		this.offset += 2
		const angle = this.buffer.readUInt16BE(this.offset) // 2 bytes
		this.offset += 2
		const satellites = this.buffer.readUInt8(this.offset) // 1 byte
		this.offset += 1
		const speed = this.buffer.readUInt16BE(this.offset) // 2 bytes
		this.offset += 2

		// IO Element
		const eventIoId = isExtended ? this.buffer.readUInt16BE(this.offset) : this.buffer.readUInt8(this.offset)
		this.offset += isExtended ? 2 : 1

		// Total IO Count (skipped, not used in output logic but typically used for validation)
		this.offset += isExtended ? 2 : 1

		const ioElements: Record<number, number | bigint | Buffer> = {}

		// Helper to read IO section (1 byte, 2 byte, 4 byte, 8 byte)
		// In Codec 8: Count is 1 byte.
		// In Codec 8 Extended: IO structure:
		// N1 (2B count) -> (ID (2B), Value (1B)) ...
		// N2 (2B count) -> (ID (2B), Value (2B)) ...
		// N4 (2B count) -> (ID (2B), Value (4B)) ...
		// N8 (2B count) -> (ID (2B), Value (8B)) ...
		// NX (2B count) -> (ID (2B), Length (2B), Value (LB)) ... (ONLY IN CODEC 8 EXTENDED)

		const readIoBlock = (byteSize: 1 | 2 | 4 | 8) => {
			const count = isExtended ? this.buffer.readUInt16BE(this.offset) : this.buffer.readUInt8(this.offset)
			this.offset += isExtended ? 2 : 1

			for (let k = 0; k < count; k++) {
				const id = isExtended ? this.buffer.readUInt16BE(this.offset) : this.buffer.readUInt8(this.offset)
				this.offset += isExtended ? 2 : 1

				let value: number | bigint
				if (byteSize === 1) {
					value = this.buffer.readInt8(this.offset)
					this.offset += 1
				} else if (byteSize === 2) {
					value = this.buffer.readInt16BE(this.offset)
					this.offset += 2
				} else if (byteSize === 4) {
					value = this.buffer.readInt32BE(this.offset)
					this.offset += 4
				} else {
					value = this.buffer.readBigInt64BE(this.offset)
					this.offset += 8
				}
				ioElements[id] = value
			}
		}

		readIoBlock(1)
		readIoBlock(2)
		readIoBlock(4)
		readIoBlock(8)

		// Variable Length IOs (Codec 8 Extended ONLY)
		if (isExtended) {
			const countX = this.buffer.readUInt16BE(this.offset)
			this.offset += 2

			for (let k = 0; k < countX; k++) {
				const id = this.buffer.readUInt16BE(this.offset)
				this.offset += 2

				const length = this.buffer.readUInt16BE(this.offset)
				this.offset += 2

				const value = this.buffer.subarray(this.offset, this.offset + length)
				// Create a copy to prevent holding reference to the entire buffer if we slice it
				const valueCopy = Buffer.from(value)

				this.offset += length
				ioElements[id] = valueCopy
			}
		}

		return {
			timestamp,
			priority,
			gps: {
				longitude,
				latitude,
				altitude,
				angle,
				satellites,
				speed,
			},
			io: {
				event_io_id: eventIoId,
				elements: ioElements,
			},
		}
	}

	private readCoordinate(): number {
		// Longitude and Latitude are 4 byte integers
		// Precision 0.0000001 (10^7) implied.
		const val = this.buffer.readInt32BE(this.offset)
		this.offset += 4

		// Some devices send 0x00000000 if invalid?
		// Teltonika coordinates are usually multiplied by 10,000,000
		if (val === 0) return 0
		return val / 10000000
	}
}
