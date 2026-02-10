import { Buffer } from 'node:buffer'

export type TeltonikaAvlData = {
	codec_id: number
	number_of_data: number
	records: TeltonikaRecord[]
}

export type TeltonikaRecord = {
	timestamp: Date
	priority: number
	gps: {
		longitude: number
		latitude: number
		altitude: number
		angle: number
		satellites: number
		speed: number
	}
	io: {
		event_io_id: number
		elements: Record<number, number | bigint | Buffer>
	}
}
