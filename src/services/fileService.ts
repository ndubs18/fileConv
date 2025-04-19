type FileData = {
	uuid: string,
	filename: string,
	sourceExt: string,
	targetExt: string
}
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

	async processFile(data: FileData) {
		//TODO: Can we just set the state object and stringify it in request body??
		const { uuid, filename, sourceExt, targetExt } = data;
		try {
			const response = await fetch('http://localhost:3000/process',
				{
					method: 'POST',
					body: JSON.stringify({
						uuid: uuid,
						filename: filename,
						sourceExt: sourceExt,
						targetExt: targetExt
					}),
					headers: {
						'Content-type': 'application/json'
					}
				})
			return await response.json();
		} catch (error) {
			console.log(error)
		}
	}

	async checkFileStatus(uuid: string) {
		try {
			const response = await fetch(`http://localhost:3000/checkStatus/${uuid}`)
			return await response.json();
		} catch (error) {
			console.log(error);
		}
	}

}
