import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { FileService } from '../../services/FileService';

let styles = {
	form: {
		margin: '0 auto',
		position: 'relative' as 'relative',
		top: '5rem',
		width: '400px'
	},
	selection: {
		display: 'flex',
		gap: '5rem',
		justifyContent: 'center',
		alignItems: 'center',
	},
	submitBtn: {
		display: 'block',
		padding: '0.5rem 2rem',
		margin: '2rem auto',
		color: 'green'
	},
	label: {
		fontWeight: 'bold',
		display: 'block',
		padding: '1rem',
		width: '10rem'
	},
	downloadLink: {
		textDecoration: 'none',
	}
}

let UploadForm = () => {
	const fileService = useRef(new FileService);
	const [fileData, setFileData] = useState(null);
	const [downloadUrl, setDownloadUrl] = useState(null)
	const [processing, setProcessing] = useState(false);
	const [error, setError] = useState(null);

	let submitHandler = async (formData: FormData) => {
		try {
			setProcessing(true);
			//upload file
			const uploadResponse = await fileService.current.uploadToS3(formData);
			const data = uploadResponse.data;
			setFileData(data);

			//process file
			const processingResponse = await fileService.current.processFile(data);
			//if process was successful, check it it's done
			if (processingResponse.status == 'success') {
				//pole to see if the conversion is complete
				const interval = setInterval(async () => {
					const statusResponse = await fileService.current.checkFileStatus(data.uuid);
					if (statusResponse.message === 'complete') {
						clearInterval(interval);
						setError('');
						setProcessing(false);
						setDownloadUrl(statusResponse.data.downloadUrl);
					}
					else {
						console.log(`Conversion is ${statusResponse.status}`);
					}
				}, 3000)

			}

		} catch (error) {
			console.log(error)
			setError('There was trouble processing your file');
		}

	}

	useEffect(() => {
	}, [fileData, downloadUrl])
	return (
		<form style={styles.form} action={submitHandler}>
			<div id='selection' style={styles.selection}>
				<label style={styles.label} htmlFor='fileUpload'>Upload a file:
					<input type='file' id='fileUpload' accept='image/*, text/plain, ' name='file' />
				</label>
				<label style={styles.label} htmlFor='targetType'> Convert to: <br />
					<select id='targetType' name='targetType'>
						<option value='.pdf'>pdf</option>
						<option value='.jpg'>jpg</option>
						<option value='.png'>png</option>
					</select>
				</label>
			</div>
			<button type='submit' style={styles.submitBtn}>CONVERT</button>
			{processing && <p>Processing...</p>}
			{downloadUrl ? <a style={styles.downloadLink} href={downloadUrl}>Download File</a> : <>{error}</>}
		</form >

	)

}
export { UploadForm }



