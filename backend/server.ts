import express from 'express';
import type { Request, Response } from 'express'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import cors from 'cors';
import { v4 } from 'uuid';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs'
import fetch from 'node-fetch';

import {
	getSignedUrl,
	S3RequestPresigner,
} from "@aws-sdk/s3-request-presigner";

let app = express();
//app.use(express.json());
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
app.use(cors());

const PORT: string = process.env.PORT;
const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
const BUCKETNAME = 'ndubscodes-fileconv';

const s3 = new S3Client({
	region: 'us-west-1',
	credentials: {
		accessKeyId: ACCESS_KEY,
		secretAccessKey: SECRET_ACCESS_KEY
	}
});

app.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
	const { originalname, mimetype, size } = req.file;
	//get filename and extension from form
	const ext = path.extname(originalname);
	//generate UUID (v4)
	const UUID = `${v4()}${ext}`;
	console.log(req.file);
	const fileStream = req.file.buffer;
	try {
		const url = await generatePresignedUrl(UUID, mimetype);
		const pushObject = await put(url, fileStream)
		res.status(200).json({ msg: 'file was uploaded' })
	} catch (error) {
		res.status(500).json({ error: 'could not upload file' });
	}
})

const generatePresignedUrl = (UUID: string, type: string) => {
	const command = new PutObjectCommand({ Bucket: BUCKETNAME, Key: UUID, ContentType: type });
	return getSignedUrl(s3, command, { expiresIn: 1800 });
}

const put = async (url: string, fileStream: Buffer) => {
	try {
		const putObject = await fetch(url, {
			method: 'PUT',
			body: fileStream
		})
		console.log(putObject);
		return putObject;

	} catch (error) {
		return error;
	}
}

app.listen(PORT, () => {
	console.log(`server listening on port ${PORT}`);
})
