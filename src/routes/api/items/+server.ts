import items from '$db/items/items';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Item } from '$db/items/type/Item';

export const GET: RequestHandler = async ({url}) => {
    const name = url.searchParams.get("name")
    const data = await items.find<Item>({"$text":{"$search":name}}, {projection:{name:1, id:1, _id:0}}).toArray()
    return json(data);
};