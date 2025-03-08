import * as React from 'react';
import { useRef, useState } from 'react';
import { FileService } from '../../services/FileService';
let styles = {
	form: {
		width: '200px'
	},
	submitBtn: {
		color: 'green'
	}
}

let UploadForm = () => {
	const fileService = useRef(new FileService);
	const [fileData, setFileData] = useState(null);
	const [processing, setProcessing] = useState(false);

	let submitHandler = async (formData: FormData) => {
		try {
			setProcessing(true);
			const uploadResponse = await fileService.current.uploadToS3(formData);
			const data = uploadResponse.data;
			setFileData(data);
			const processingResponse = await fileService.current.processFile(data.uuid, data.filename);
			console.log(processingResponse);
		} catch (error) {
			console.log(error)
		}
	}
	return (
		<form style={styles.form} action={submitHandler}>
			<label htmlFor='fileUpload'>Upload a file:</label> <br></br>
			<input type='file' id='fileUpload' accept='image/*, text/plain' name='file' />
			<button type='submit' style={styles.submitBtn}>CONVERT</button>
		</form >

	)

}
export { UploadForm }



