import express from 'express';
import type { Request, Response } from 'express'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import {
	getSignedUrl,
	S3RequestPresigner,
} from "@aws-sdk/s3-request-presigner";

let app = express();
const PORT: string = process.env.PORT;
const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
const BUCKETNAME = 'ndubscodesfileconverter';

// JS SDK v3 does not support global configuration.
// Codemod has attempted to pass values to each service client in this file.
// You may need to update clients outside of this file, if they use global config.
const s3 = new S3Client({
	region: 'us-west-1',
	credentials: {
		accessKeyId: ACCESS_KEY,
		secretAccessKey: SECRET_ACCESS_KEY
	}
});

app.get('/upload', async (req: Request, res: Response) => {
	let url = await generatePresignedUrl();
	res.send(url);

})

let generatePresignedUrl = () => {
	const command = new PutObjectCommand({ Bucket: BUCKETNAME, Key: ACCESS_KEY });
	return getSignedUrl(s3, command, { expiresIn: 3600 });
}


app.listen(PORT, () => {
	console.log(`server listening on port ${PORT}`);
})
