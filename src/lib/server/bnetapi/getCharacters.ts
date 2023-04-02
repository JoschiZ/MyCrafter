import type {Character} from "$db/user/UserModel"

export async function getCharacters(region: string, accessToken: string) {
    const response = await fetch(`https://${region}.api.blizzard.com/profile/user/wow?namespace=profile-${region}&locale=en_US&access_token=${accessToken}`)
    const allCharacters = []
    if (response.ok) {
        const accountSummary = await response.json() as ProfileSummary

        for (const account of accountSummary.wow_accounts) {
            for (const rawCharacter of account.characters) {
                //Characters that are level 60 or lower cannot have DF Professions and are irrelevant.
                if (rawCharacter.level < 61) {
                    continue
                }
                const character: Character = {
                    name: rawCharacter.name,

                    // @ts-expect-error The _id field is just called id in the api return. Not gonna type that 
                    _id: rawCharacter.id + "",

                    // The API JSON includes a key href link, that we are not interested in. Thus we explicitely assign the data.
                    // @ts-expect-error The API JSON calls _id id. 
                    realm: { name: rawCharacter.realm.name, _id: rawCharacter.realm.id + "", slug: rawCharacter.realm.slug },

                    // @ts-expect-error The API JSON is nested this in fact exist!
                    faction: rawCharacter.faction.type,
                    level: rawCharacter.level,
                }

                allCharacters.push(character)
            }
        }
    }
    return allCharacters
}

type ProfileSummary = {
    wow_accounts: [APIAccount]
}

type APIAccount = {
    characters: [Character]
}


