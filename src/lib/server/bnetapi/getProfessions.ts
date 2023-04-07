import { CraftedItemModel} from "$db/items/ItemModel"
import { UserRecipe, type CharacterProfession } from "$db/user/UserModel"
import { MissingAuthorize } from "@auth/core/errors"


export async function getProfessions(region: string, realmSlug: string, character: string, accessToken: string) {    
    const relevantItems = await CraftedItemModel.find({}, {_id: 1, "recipe._id":1}).lean({virtuals:true}).exec()
    
    const relevantItemsMap = new Map()
    for (const item of relevantItems) {
        relevantItemsMap.set(item.recipe.recipeID, true)
    }

    character = character.toLowerCase()
    const response = await fetch(`https://${region}.api.blizzard.com/profile/wow/character/${realmSlug}/${character}/professions?namespace=profile-${region}&locale=en_US&access_token=${accessToken}`)
    if (!response.ok)
        throw new MissingAuthorize()
    const json = await response.json() as APIProfessionResponse

    const professions: CharacterProfession[] = []

    for (const primary of json.primaries) {
        const professionID = primary.profession.id
        const skillLineID = professionIdToSkillLineID.get(professionID)
        if (!skillLineID) {
            continue
        }

        const recepies = []
        for (const tier of primary.tiers) {
            //We only need to get the DF recipes all others are irrelevant
            if (!tier.tier.name.includes("Dragon Isles")) {
                continue
            }

            for (const rawRecipe of tier.known_recipes) {
                if (!relevantItemsMap.has(rawRecipe.id + "")) {
                    continue
                }
                const recipe = new UserRecipe()

                recipe.name = rawRecipe.name
                recipe.recipeID = rawRecipe.id + ""

                recepies.push(recipe)
            }
        }

        const characterProfession: CharacterProfession = {
            name: primary.profession.name,
            skillLineID: skillLineID + "",
            recipes: recepies
        }
        professions.push(characterProfession)
    }

    return professions
}


type APIProfessionResponse = {
    primaries: APICharacterPrimaryProfession[]
}

type APICharacterPrimaryProfession = {
    profession: { name: string, id: number }
    tiers: APIProfessionTier[]
}

type APIProfessionTier = {
    skillPoints: number
    tier: { name: string, id: number }
    known_recipes: { name: string, id: number }[]
}

const professionIdToSkillLineID = new Map([
    [164, 2822],
    [165, 2830],
    [171, 2823],
    [182, 2832],
    [185, 2824],
    [186, 2833],
    [197, 2831],
    [202, 2827],
    [333, 2825],
    [356, 2826],
    [393, 2834],
    [755, 2829],
    [773, 2828]
])


