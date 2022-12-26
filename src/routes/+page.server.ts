import type { Profession } from "$db/professions/profession";
import { professions } from "$db/professions/professions";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async function(){
    const data = await professions.find<Profession>({}, {projection:{name:1, icon:1, _id:0}}).toArray()

    return {
        professions: data
    }
}