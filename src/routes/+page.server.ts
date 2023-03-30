import ProfessionModel, { Profession } from "$db/professions/ProfessionModel";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async function(){
    const data = await ProfessionModel.find<Profession>({}, {name:1, icon:1, _id:0}).lean().exec()


    return {
        professions: data
    }
}