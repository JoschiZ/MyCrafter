import { DB_URI } from '$env/static/private';
import { setGlobalOptions } from '@typegoose/typegoose';
import mongoose from "mongoose";
import logger from '../logger';


export async function StartMongo() {
    logger.log("info", "Connecting to MongoDB")
    mongoose.set("strictQuery", false)
    await mongoose.connect(DB_URI)
}
