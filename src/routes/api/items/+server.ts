import { CraftedItemModel } from '$db/items/ItemModel';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import logger from '$lib/server/logger';

export const GET: RequestHandler = async ({ url }) => {
    const name = url.searchParams.get("name")
    const data = await CraftedItemModel.find({ name: { $regex: name, $options: "i" } }).lean({virtuals:true}).exec()
    logger.debug(`api/items: request ${name} result ${data.toString()}`)
    return json(data);
};