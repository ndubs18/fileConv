import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import dotenv from 'dotenv'
dotenv.config({ path: '../.env' });

const documentSchema = new Schema({
	uuid: { type: String, required: true },
	filename: { type: String, required: true },
	status: { type: String, required: true, default: 'pending' },
	convertedUrl: { type: String }
});
const Document = mongoose.model('Document', documentSchema);
export default Document;
