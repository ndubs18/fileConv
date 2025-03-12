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
			const processingResponse = await fileService.current.processFile(data);
			console.log(processingResponse);
			setProcessing(false);

		} catch (error) {
			console.log(error)
		}

	}
	return (
		<form style={styles.form} action={submitHandler}>
			<label htmlFor='fileUpload'>Upload a file:
				<input type='file' id='fileUpload' accept='image/*, text/plain, ' name='file' />
			</label>
			<label htmlFor='targetTypes'> Convert to: <br />
				<select id='targetType' name='targetType'>
					<option value='.pdf'>pdf</option>
					<option value='.jpg'>jpg</option>
					<option value='.png'>png</option>
				</select>
			</label>
			<button type='submit' style={styles.submitBtn}>CONVERT</button>
		</form >

	)

}
export { UploadForm }



