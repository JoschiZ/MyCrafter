import type { Character, CharacterProfession, User } from '$db/user/type/User';
import { characterProfessionSchema } from '$db/user/type/User.zod';
import users from '$db/user/users';
import { getToken } from '$lib/server/middleware/authjs-helper';
import { ZodError } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { getCharacters } from '$lib/server/bnetapi/getCharacters';

export const load = (async (event) => {
    const session = await event.locals.getSession()
    const token = await getToken(event.cookies)

    const user = await users.findOne<User>({ accountID: token?.sub }, { projection: { _id: 0 } })


    return {
        session: session,
        user: user
    };
}) satisfies PageServerLoad;

export const actions = {
    default: async (event) => {
        const formData = await event.request.formData()
        const data = formData.get("profession-json")

        if (!data) {
            return fail(400, { professions: data, message: "Please enter your Crafter.io Addon export!" })
        }

        const professions: CharacterProfession[] = []
        let partialCharacter: Character
        try {
            //Note this is NOT a complete character. It will miss the id, realm.id, realm.slug, faction and level
            partialCharacter = JSON.parse(data.toString()) as Character
            if (!partialCharacter.professions) {
                throw new SyntaxError("Import is missing a professions field")
            }

            for (const profession of partialCharacter.professions) {
                characterProfessionSchema.parse(profession)
                professions.push(profession)
            }

        } catch (error) {
            if (error instanceof SyntaxError || error instanceof ZodError) {
                console.log(error)
                return fail(400, { professions: data, message: "Validation of the input failed, please reexport your data" })
            }
            throw error
        }


        const token = await getToken(event.cookies)
        if (!token){
            return fail(400, { professions: data, message: "Please relog" })
        }
        const user = await users.findOne<User>({ accountID: token?.sub })

        if (!user) {
            //TODO: Insert Update Characters Method HERE
            return fail(400, { professions: data, message: "Userdata Missing, try loging out and in again!" })
        }

        function findCharacter(characters: Character[], partialCharacter: Character): Character | undefined {
            if(!characters){
                return
            }
            const correctCharacterIndex = characters.findIndex(character => character.name === partialCharacter.name && character.realm.id === partialCharacter.realm.id)
            return characters[correctCharacterIndex]
        }

        let correctCharacter = findCharacter(user.characters, partialCharacter)

        if (!correctCharacter) {
            const newCharacters = await getCharacters(user.region, token.accessToken)
            correctCharacter = findCharacter(newCharacters, partialCharacter)

            if(!correctCharacter){
                return fail(400, { professions: data, message: "Could not find the associated character or fetch it from Blizzard. Try to log out and in again." })
            }
            
            //TODO: Merge this into one singe update with the following updates instead of doing two.
            const update = await users.updateOne(
            {
                accountID: user.accountID
            },
            {
                $set: {
                    "characters": newCharacters,
                }
            })

            if (update.matchedCount <= 0) {
                return fail(400, { professions: data, message: "Database Error. If this persists, open an issue on GitHub, that contains your import string" })
            }
        }



        if (!correctCharacter.professions) {
            const update = await users.updateOne(
                {
                    accountID: user.accountID
                },
                {
                    $set: {
                        "characters.$[character].professions": partialCharacter.professions
                    }
                },
                {
                    arrayFilters: [
                        { "character.name": partialCharacter.name, "character.realm.id": partialCharacter.realm.id }]
                })
            if (update.matchedCount <= 0) {
                return fail(400, { professions: data, message: "Database Error. If this persists, open an issue on GitHub, that contains your import string" })
            }
            return { sucess: true }
        }

        for (const profession of professions) {
            const update = await users.updateOne(
                {
                    accountID: user.accountID
                },
                {
                    $set: {
                        "characters.$[character].professions.$[profession].progress": profession.progress
                    }
                },
                {
                    arrayFilters: [
                        { "character.name": partialCharacter.name, "character.realm.id": partialCharacter.realm.id },
                        { "profession.skillLineID": profession.skillLineID}
                    ]

                }
            )
            if (update.matchedCount <= 0){
                return fail(400, { professions: data, message: "Database Error. If this persists, open an issue on GitHub, that contains your import string" })
            }
        }
        return { sucess: true }
    }
} satisfies Actions