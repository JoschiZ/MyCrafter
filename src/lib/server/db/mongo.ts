import { MongoClient } from "mongodb"
import { DB_URI } from '$env/static/private';

const client = new MongoClient(DB_URI)

export async function StartMongo() {
    console.log("Starting Mongo....")
    return client.connect()
}

export default client.db("MyCrafter") // select database