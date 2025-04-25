import * as React from 'react';
import { useEffect, useRef, useState, FormEvent } from 'react';
import { FileService } from '../../services/FileService';

let styles = {
	form: {
		display: 'flex',
		flexDirection: 'column' as 'column',
		alignItems: 'center',
		margin: '0 auto',
		position: 'relative' as 'relative',
		top: '5rem',
		padding: '1rem'
	},
	selection: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	input: {
		display: 'block'
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
		padding: '0 1rem',
		textWrap: 'nowrap' as 'nowrap',
		width: 'auto'
	},
	downloadLink: {
		textDecoration: 'none',
	}
}

let UploadForm = () => {
	const fileService = useRef(new FileService);
	const [downloadUrl, setDownloadUrl] = useState(null)
	const [processing, setProcessing] = useState(false);
	const [error, setError] = useState(null);

	let submitHandler = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		try {
			setProcessing(true);
			//upload file
			const formData = new FormData(e.currentTarget);
			const uploadResponse = await fileService.current.uploadToS3(formData);
			const data = uploadResponse.data;

			//process file
			const processingResponse = await fileService.current.processFile(data);
			//if process was successful, check it it's done
			if (processingResponse.status == 'success') {
				//poll to see if the conversion is complete
				const interval = setInterval(async () => {
					const statusResponse = await fileService.current.checkFileStatus(data.uuid);
					if (statusResponse.message === 'complete') {
						clearInterval(interval);
						setError('');
						setProcessing(false);
						setDownloadUrl(statusResponse.data.downloadUrl);
					}
					else {
						console.log(`Conversion was ${statusResponse.status}`);
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
		<form style={styles.form} onSubmit={submitHandler}>
			<div id='selection' style={styles.selection}>
				<label style={styles.label} htmlFor='fileUpload'>Upload a file:
					<input style={styles.input} type='file' id='fileUpload' accept='image/*, text/plain, ' name='file' />
				</label>
				<label style={{ ...styles.selection, ...styles.label }} htmlFor='targetType'> Convert to: <br />
					<select id='targetType' name='targetType'>
						<option value='.pdf'>pdf</option>
						<option value='.jpg'>jpg</option>
						<option value='.png'>png</option>
					</select>
				</label>
			</div>
			<button type='submit' style={styles.submitBtn} disabled={processing ? true : false}>CONVERT</button>
			{processing && <p>Processing...</p>}
			{downloadUrl ? <a style={styles.downloadLink} href={downloadUrl}>Download File</a> : <>{error}</>}
		</form >

	)

}
export { UploadForm }



