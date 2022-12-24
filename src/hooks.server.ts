import { StartMongo } from "$db/mongo";

StartMongo().then(()=>{
    console.log("Mongo started")
}).catch((e) =>
    console.error(e)
)

