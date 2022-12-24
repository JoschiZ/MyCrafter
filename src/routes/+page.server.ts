import { professions } from "$db/professions/professions";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async function(){
    const data = await professions.find({}, {limit: 10}).toArray()

    return {
        props: {
            professions: data
        }
    }
}