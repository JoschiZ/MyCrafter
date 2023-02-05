import type { Model } from "mongoose"

/**
 * 
 * @param path An array of strings representing the path to the schema.
 * @param model A Model to use as a starting point
 * @returns The Schema
 */
//TODO: This can probably be vastly improved by some reflection magic instead of requiring hand written string paths.
export function getNestedSchema(path: string[], model: Model<any>){
    let currentSchema = model.schema
    while (path.length >= 1){
        const currentPath = path.shift()
        for (const path of currentSchema.childSchemas){
            if (path.model.path == currentPath){
                currentSchema = path.schema
                break
            }
        }
    }
    return currentSchema
}