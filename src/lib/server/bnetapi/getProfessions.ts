import type { CharacterProfession, UserRecipe } from "$db/user/type/User"

export async function getProfessions(region: string, realmSlug: string, character: string, accessToken: string) {
    character = character.toLowerCase()
    const response = await fetch(`https://${region}.api.blizzard.com/profile/wow/character/${realmSlug}/${character}/professions?namespace=profile-${region}&locale=en_US&access_token=${accessToken}`)

    if (!response.ok)
        return []

    const json = await response.json() as APIProfessionResponse
    const professions: CharacterProfession[] = []

    for (const primary of json.primaries) {
        const recepies = []
        for (const tier of primary.tiers) {
            //We only need to get the DF recipes all others are irrelevant
            if (!tier.tier.name.includes("Dagon Isles")) {
                continue
            }

            for (const rawRecipe of tier.recepies) {
                const recipe: UserRecipe = {
                    recipeID: rawRecipe.id,
                    name: rawRecipe.name
                }
                recepies.push(recipe)
            }
        }
        const characterProfession: CharacterProfession = {
            name: primary.profession.name,
            id: primary.profession.id,
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
    recepies: { name: string, id: number }[]
}