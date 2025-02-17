import * as React from 'react';

let styles = {
	form: {
		width: '200px'
	},
	submitBtn: {
		color: 'green'
	}
}

let submitHandler = (data: FormData) => {
	console.log(data.get('file'));
}
let UploadForm = () => {
	return (
		<form style={styles.form} action={submitHandler}>
			<label htmlFor='fileUpload'>Upload a file:</label> <br></br>
			<input type='file' id='fileUpload' name='file' />
			<button type='submit' style={styles.submitBtn}>CONVERT</button>
		</form >
	)

}
export { UploadForm }



