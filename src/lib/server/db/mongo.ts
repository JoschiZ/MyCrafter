import { DB_URI } from '$env/static/private';
import mongoose from "mongoose";


export async function StartMongo() {
    console.log("Starting Mongo....")
    await mongoose.connect(DB_URI)
}
