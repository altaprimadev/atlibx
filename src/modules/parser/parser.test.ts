import { describe, it, expect } from 'vitest'
import { Buffer } from 'node:buffer'
import { TeltonikaParser } from './index'

describe('TeltonikaParser', () => {
	const createBaseRecord = () => {
		const timestamp = BigInt(Date.now())
		const longitude = 123456789
		const latitude = 98765432
		const altitude = 100
		const angle = 200
		const satellites = 5
		const speed = 60

		const buffer = Buffer.alloc(1024)
		let offset = 0

		buffer.writeBigUInt64BE(timestamp, offset)
		offset += 8
		buffer.writeUInt8(1, offset)
		offset += 1 // Priority
		buffer.writeInt32BE(longitude, offset)
		offset += 4
		buffer.writeInt32BE(latitude, offset)
		offset += 4
		buffer.writeInt16BE(altitude, offset)
		offset += 2
		buffer.writeUInt16BE(angle, offset)
		offset += 2
		buffer.writeUInt8(satellites, offset)
		offset += 1
		buffer.writeUInt16BE(speed, offset)
		offset += 2

		return { buffer, offset, timestamp }
	}

	it('should correctly parse a standard Codec 8 packet', () => {
		const { buffer: recordBuffer, offset: recordOffset, timestamp } = createBaseRecord()
		let offset = recordOffset

		// IO Header (Event ID, Total IO)
		recordBuffer.writeUInt8(10, offset)
		offset += 1 // Event ID (ID 10)
		recordBuffer.writeUInt8(4, offset)
		offset += 1 // Total IO Count

		// 1 Byte IOs
		recordBuffer.writeUInt8(1, offset)
		offset += 1 // Count
		recordBuffer.writeUInt8(10, offset)
		offset += 1 // ID
		recordBuffer.writeInt8(50, offset)
		offset += 1 // Value

		// 2 Byte IOs
		recordBuffer.writeUInt8(1, offset)
		offset += 1
		recordBuffer.writeUInt8(11, offset)
		offset += 1
		recordBuffer.writeInt16BE(300, offset)
		offset += 2

		// 4 Byte IOs
		recordBuffer.writeUInt8(1, offset)
		offset += 1
		recordBuffer.writeUInt8(12, offset)
		offset += 1
		recordBuffer.writeInt32BE(70000, offset)
		offset += 4

		// 8 Byte IOs
		recordBuffer.writeUInt8(1, offset)
		offset += 1
		recordBuffer.writeUInt8(13, offset)
		offset += 1
		recordBuffer.writeBigInt64BE(BigInt(1234567890123), offset)
		offset += 8

		const recordData = recordBuffer.subarray(0, offset)

		// Construct Packet
		const dataLen = 1 + 1 + recordData.length + 1
		const packetBuffer = Buffer.alloc(4 + 4 + dataLen + 4)
		let pOff = 0

		packetBuffer.writeUInt32BE(0, pOff)
		pOff += 4 // Preamble (AVL)
		packetBuffer.writeUInt32BE(dataLen, pOff)
		pOff += 4 // Data Length
		packetBuffer.writeUInt8(0x08, pOff)
		pOff += 1 // Codec ID
		packetBuffer.writeUInt8(1, pOff)
		pOff += 1 // Count 1
		recordData.copy(packetBuffer, pOff)
		pOff += recordData.length
		packetBuffer.writeUInt8(1, pOff)
		pOff += 1 // Count 2
		packetBuffer.writeUInt32BE(0, pOff)
		pOff += 4 // CRC dummy

		const parser = new TeltonikaParser(packetBuffer)
		expect(parser.isImei).toBe(false)

		const result = parser.getAvl()
		expect(result.codec_id).toBe(0x08)
		expect(result.number_of_data).toBe(1)

		const rec = result.records[0]
		expect(rec.timestamp.getTime()).toBe(Number(timestamp))
		expect(rec.io.elements[10]).toBe(50)
		expect(rec.io.elements[11]).toBe(300)
		expect(rec.io.elements[12]).toBe(70000)
		expect(rec.io.elements[13]).toBe(BigInt(1234567890123))
	})

	it('should correctly parse a Codec 8 Extended packet with variable length IOs', () => {
		const { buffer: recordBuffer, offset: recordOffset } = createBaseRecord()
		let offset = recordOffset

		// IO Header Codec 8E: Event IO ID (2B), Total IO Count (2B)
		recordBuffer.writeUInt16BE(256, offset)
		offset += 2 // Event ID: 256
		recordBuffer.writeUInt16BE(1, offset)
		offset += 2 // Total IO Count

		// Codec 8E IO structure: Count (2B), then (ID 2B, Val XB)
		recordBuffer.writeUInt16BE(1, offset)
		offset += 2 // 1 Byte Count
		recordBuffer.writeUInt16BE(500, offset)
		offset += 2 // ID 500
		recordBuffer.writeInt8(123, offset)
		offset += 1 // Value 123

		recordBuffer.writeUInt16BE(0, offset)
		offset += 2 // 2 Byte Count
		recordBuffer.writeUInt16BE(0, offset)
		offset += 2 // 4 Byte Count
		recordBuffer.writeUInt16BE(0, offset)
		offset += 2 // 8 Byte Count

		// Variable Length IOs
		const varData = Buffer.from('TEST_VIN_12345', 'ascii')
		recordBuffer.writeUInt16BE(1, offset)
		offset += 2 // Count
		recordBuffer.writeUInt16BE(1001, offset)
		offset += 2 // ID
		recordBuffer.writeUInt16BE(varData.length, offset)
		offset += 2 // Length
		varData.copy(recordBuffer, offset)
		offset += varData.length // Value

		const recordData = recordBuffer.subarray(0, offset)

		// Codec 8 Extended ID = 0x8E
		const dataLen = 1 + 1 + recordData.length + 1
		const packetBuffer = Buffer.alloc(4 + 4 + dataLen + 4)
		let pOff = 0
		packetBuffer.writeUInt32BE(0, pOff)
		pOff += 4
		packetBuffer.writeUInt32BE(dataLen, pOff)
		pOff += 4
		packetBuffer.writeUInt8(0x8e, pOff)
		pOff += 1
		packetBuffer.writeUInt8(1, pOff)
		pOff += 1
		recordData.copy(packetBuffer, pOff)
		pOff += recordData.length
		packetBuffer.writeUInt8(1, pOff)
		pOff += 1
		packetBuffer.writeUInt32BE(0, pOff)
		pOff += 4

		const parser = new TeltonikaParser(packetBuffer)
		const result = parser.getAvl()

		expect(result.codec_id).toBe(0x8e)
		const rec = result.records[0]
		expect(rec.io.event_io_id).toBe(256)
		expect(rec.io.elements[500]).toBe(123)

		const varVal = rec.io.elements[1001]
		expect(Buffer.isBuffer(varVal)).toBe(true)
		expect((varVal as Buffer).toString('ascii')).toBe('TEST_VIN_12345')
	})

	it('should handle negative coordinates', () => {
		const buffer = Buffer.alloc(100)
		let offset = 0
		// Timestamp etc... skipping to coordinates
		buffer.writeBigUInt64BE(BigInt(Date.now()), offset)
		offset += 8
		buffer.writeUInt8(1, offset)
		offset += 1

		// Negative Longitude: -12.3456789 -> -123456789
		buffer.writeInt32BE(-123456789, offset)
		offset += 4
		buffer.writeInt32BE(98765432, offset)
		offset += 4
		buffer.writeInt16BE(100, offset)
		offset += 2
		buffer.writeUInt16BE(200, offset)
		offset += 2
		buffer.writeUInt8(5, offset)
		offset += 1
		buffer.writeUInt16BE(60, offset)
		offset += 2

		// IOs (minimal)
		buffer.writeUInt8(0, offset)
		offset += 1
		buffer.writeUInt8(0, offset)
		offset += 1
		buffer.writeUInt8(0, offset)
		offset += 1
		buffer.writeUInt8(0, offset)
		offset += 1
		buffer.writeUInt8(0, offset)
		offset += 1
		buffer.writeUInt8(0, offset)
		offset += 1

		const recordData = buffer.subarray(0, offset)
		const dataLen = 1 + 1 + recordData.length + 1
		const packet = Buffer.alloc(4 + 4 + dataLen + 4)
		let p = 0
		packet.writeUInt32BE(0, p)
		p += 4
		packet.writeUInt32BE(dataLen, p)
		p += 4
		packet.writeUInt8(0x08, p)
		p += 1
		packet.writeUInt8(1, p)
		p += 1
		recordData.copy(packet, p)
		p += recordData.length
		packet.writeUInt8(1, p)
		p += 1
		packet.writeUInt32BE(0, p)
		p += 4

		const parser = new TeltonikaParser(packet)
		const res = parser.getAvl()
		expect(res.records[0].gps.longitude).toBeCloseTo(-12.3456789)
	})

	it('should identify IMEI packet', () => {
		const buffer = Buffer.from('000F313233343536373839303132333435', 'hex')
		const parser = new TeltonikaParser(buffer)
		expect(parser.isImei).toBe(true)
		expect(() => parser.getAvl()).toThrow(/Buffer contains IMEI/)
	})

	it('should throw error for invalid preamble (not 0x00000000)', () => {
		const buffer = Buffer.alloc(20)
		buffer.writeUInt32BE(0x00000001, 0) // Invalid preamble
		const parser = new TeltonikaParser(buffer)
		// It's identified as IMEI because it doesn't start with 0
		expect(parser.isImei).toBe(true)
		expect(() => parser.getAvl()).toThrow(/Buffer contains IMEI/)

		// Force it to not be IMEI to test the preamble check in getAvl
		// @ts-ignore
		parser.isImei = false
		expect(() => parser.getAvl()).toThrow(/Invalid preamble: expected 0x00000000/)
	})

	it('should throw error if buffer is too short (shorter than expected length)', () => {
		const buffer = Buffer.alloc(20)
		buffer.writeUInt32BE(0, 0)
		buffer.writeUInt32BE(50, 4) // Says 50 bytes data, but buffer is only 20
		const parser = new TeltonikaParser(buffer)
		expect(() => parser.getAvl()).toThrow(/Buffer too short/)
	})

	it('should identify IMEI if buffer is too short (< 4 bytes)', () => {
		const buffer = Buffer.from('0011', 'hex')
		const parser = new TeltonikaParser(buffer)
		expect(parser.isImei).toBe(true)
	})

	it('should handle mismatched data counts (numberOfData1 !== numberOfData2)', () => {
		const { buffer: recordBuffer, offset: recordOffset } = createBaseRecord()
		let offset = recordOffset
		recordBuffer.writeUInt8(0, offset) // Event ID
		offset += 1
		recordBuffer.writeUInt8(0, offset) // Total IO
		offset += 1
		recordBuffer.writeUInt8(0, offset) // 1B count
		offset += 1
		recordBuffer.writeUInt8(0, offset) // 2B count
		offset += 1
		recordBuffer.writeUInt8(0, offset) // 4B count
		offset += 1
		recordBuffer.writeUInt8(0, offset) // 8B count
		offset += 1

		const recordData = recordBuffer.subarray(0, offset)
		const dataLen = 1 + 1 + recordData.length + 1
		const packet = Buffer.alloc(4 + 4 + dataLen + 4)
		let p = 0
		packet.writeUInt32BE(0, p)
		p += 4
		packet.writeUInt32BE(dataLen, p)
		p += 4
		packet.writeUInt8(0x08, p)
		p += 1
		packet.writeUInt8(1, p) // numberOfData1
		p += 1
		recordData.copy(packet, p)
		p += recordData.length
		packet.writeUInt8(2, p) // numberOfData2 (mismatch!)
		p += 1
		packet.writeUInt32BE(0, p)
		p += 4

		const parser = new TeltonikaParser(packet)
		const res = parser.getAvl()
		expect(res.number_of_data).toBe(1)
	})

	it('should return 0 for zero coordinate value', () => {
		const { buffer: recordBuffer, offset: recordOffset } = createBaseRecord()
		let offset = recordOffset
		// Rewrite zero coordinates
		recordBuffer.writeInt32BE(0, recordOffset - 15) // Longitude pos (estimate based on createBaseRecord)

		// Actually easier to just test readCoordinate directly or make a clean packet
		const buffer = Buffer.alloc(4)
		buffer.writeInt32BE(0, 0)
		const parser = new TeltonikaParser(buffer)
		// @ts-ignore
		expect(parser.readCoordinate()).toBe(0)
	})
})
