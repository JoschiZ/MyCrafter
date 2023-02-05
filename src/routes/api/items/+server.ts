import ItemModel from '$db/items/ItemModel';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';


export const GET: RequestHandler = async ({ url }) => {
    const name = url.searchParams.get("name")
    const data = await ItemModel.find({ name: { $regex: name, $options: "i" } }).lean().exec()
    return json(data);
};