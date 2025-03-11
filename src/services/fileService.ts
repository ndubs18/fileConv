export class FileService {

	async uploadToS3(file: FormData) {

		try {
			const response = await fetch('http://localhost:3000/upload',
				{
					method: 'POST',
					body: file,
				})
			return await response.json();
		} catch (error) {
			return error;
		}

	}

	async processFile(uuid: string, filename: string) {
		console.log(uuid);
		const response = await fetch('http://localhost:3000/process',
			{
				method: 'POST',
				body: JSON.stringify({ uuid: uuid, filename: filename }),
				headers: {
					'Content-type': 'application/json'

				}

			})

		return await response.json();
	}

	async checkFileStatus(uuid: string) {
		const response = await fetch(`http://localhost:3000/checkStatus?id=${uuid}`)
		return response;
	}

}
