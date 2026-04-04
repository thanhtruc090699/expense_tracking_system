import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
//import axios, { AxiosRequestConfig } from 'axios';

@Injectable()
export class OcrService {
	// Hard-coded url for now. No key is needed for this one.
	private readonly remoteUrl =
		'https://api.ocr.space/parse/imageurl?apikey=helloworld&url=https://dl.a9t9.com/ocr/solarcell.jpg';

	async fetchOcr() {

		// TODO: remove axios code. I think it's now part of the stdlib or something.
		/*
		const config: AxiosRequestConfig = {
			url: this.remoteUrl,
			method: 'GET',
			timeout: 10000,
			headers: {
				'User-Agent': 'nestjs-axios-client',
				Accept: 'application/json',
			},
		};

		try {
			const resp = await axios.request(config);
			return { status: resp.status, headers: resp.headers, data: resp.data };
		} catch (err: any) {
			const status = err?.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
			const data = err?.response?.data ?? { message: err?.message ?? 'Unknown error' };
			throw new HttpException({ status, data }, status);
		}
		*/
	}
}
