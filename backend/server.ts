import express from 'express';
import type { Request, Response } from 'express'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import cors from 'cors';
import { v4 } from 'uuid';
import multer from 'multer';
import path from 'node:path';
import fetch from 'node-fetch';
import mongoose from 'mongoose'
import Document from './database/models/document.js'
import fs from 'node:fs'
import Readable from 'node:stream'

import { Queue, Worker } from 'bullmq'
const conversionQueue = new Queue('conversion-queue');

import {
	getSignedUrl,
	S3RequestPresigner,
} from "@aws-sdk/s3-request-presigner";

let app = express();
app.use(cors());
app.use(express.json());

const __dirname = path.resolve();

//multer
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

//aws
const PORT: string = process.env.PORT;
const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
const BUCKETNAME = 'ndubscodes-fileconv';

//mongodb
const db_uname = process.env.DB_UNAME;
const db_pwd = encodeURIComponent(process.env.DB_PWD);


const uri = `mongodb+srv://${db_uname}:${db_pwd}@fileconv.unfqz.mongodb.net/?retryWrites=true&w=majority&appName=fileConv`
mongoose.connect(uri);

app.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
	const s3 = new S3Client({
		region: 'us-west-1',
		credentials: {
			accessKeyId: ACCESS_KEY,
			secretAccessKey: SECRET_ACCESS_KEY
		}
	});
	const { originalname, mimetype, size } = req.file;
	//generate uuid
	const ext = path.extname(originalname);
	const uuid = `${v4()}${ext}`;
	const fileStream = req.file.buffer;
	try {
		const url = await generatePresignedUrl(s3, uuid, mimetype);
		const pushObject = await uploadFile(url, fileStream)
		res.status(200).json({
			status: "success",
			data: {
				uuid: uuid, filename: originalname
			},
			message: null
		})
	} catch (error) {
		res.status(500).json({ error: error });
	}
})

app.post('/process', async (req, res) => {
	const { uuid, filename } = req.body;
	const document = new Document({ uuid: uuid, filename: filename });

	await document.save();

	await conversionQueue.add('fileConversion', req.body)

	res.status(200).json({
		status: 'success',
		data: null,
		message: null
	})
})



const generatePresignedUrl = (s3: S3Client, uuid: string, type: string) => {
	const command = new PutObjectCommand({ Bucket: BUCKETNAME, Key: uuid, ContentType: type });
	return getSignedUrl(s3, command, { expiresIn: 1800 });
}

const uploadFile = async (url: string, fileStream: Buffer) => {
	try {
		const uploadObject = await fetch(url, {
			method: 'PUT',
			body: fileStream
		})
		return uploadObject;

	} catch (error) {
		return error;
	}
}

const worker = new Worker('conversion-queue', async job => {
	const { uuid, filename } = job.data;
	const tempInputPath = path.join(`/tmp`, filename);
	const tempOutputPath = path.join(`/tmp`, `${uuid}.pdf`);

	const s3 = new S3Client({
		region: 'us-west-1',
		credentials: {
			accessKeyId: ACCESS_KEY,
			secretAccessKey: SECRET_ACCESS_KEY
		}
	});

	const getObjectCommand = new GetObjectCommand({
		Bucket: BUCKETNAME,
		Key: uuid
	})


	const response = await s3.send(getObjectCommand);
	const localWriteStream = fs.createWriteStream(tempInputPath);
	if (response.Body instanceof Readable) {
		response.Body.pipe(localWriteStream);
		console.log('body is instance of readable');
	}
	else {
		console.log('body is not instance of readable');
	}
},
	{
		connection: {
			host: 'localhost',
			port: 6379,
		}
	}
)
worker.on('completed', job => {
	console.log(`Job ${job.id} was completed`);
})

worker.on('error', error => {
	console.log(error);
})

const gracefulShutdown = async (signal: any) => {
	console.log(`Received ${signal}, closing server...`);
	await worker.close();
	//Other asynchronous closings
	process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

app.listen(PORT, () => {
	console.log(`server listening on port ${PORT}`);
})
