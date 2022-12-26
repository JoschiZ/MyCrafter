import db from "$db/mongo"
export const professions = db.collection("professions")
export const professionNames = await professions.find({}, {projection: {name:1, _id:0}}).toArray()