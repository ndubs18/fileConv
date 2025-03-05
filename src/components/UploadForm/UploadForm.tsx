import * as React from 'react';

let styles = {
	form: {
		width: '200px'
	},
	submitBtn: {
		color: 'green'
	}
}

let submitHandler = async (data: FormData) => {
	try {
		const res = await fetch('http://localhost:3000/upload',
			{
				method: 'POST',
				body: data,
			})
		console.log(res);
	} catch (error) {
		console.log(error)
	}
}

let uploadFile = () => {
	/*TODO: This will utilize the file service
	 *The file service is what communicates with the backend API
	*/
}
let UploadForm = () => {
	return (
		<form style={styles.form} action={submitHandler}>
			<label htmlFor='fileUpload'>Upload a file:</label> <br></br>
			<input type='file' id='fileUpload' accept='image/*, text/plain' name='file' />
			<button type='submit' style={styles.submitBtn}>CONVERT</button>
		</form >
	)

}
export { UploadForm }



