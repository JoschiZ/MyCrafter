import type { Character, CharacterProfession, User } from '$db/user/type/User';
import { characterProfessionSchema } from '$db/user/type/User.zod';
import users from '$db/user/users';
import { getToken } from '$lib/server/middleware/authjs-helper';
import { ZodError } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { getCharacters } from '$lib/server/bnetapi/getCharacters';
import { getProfessions } from '$lib/server/bnetapi/getProfessions';
import { updateCharacters } from '$db/user/queries/updateCharacters';




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
    updateProgress: async (event) => {
        const formData = await event.request.formData()
        const data = formData.get("profession-json")

        if (!data) {
            return fail(400, { professions: data, message: "Please enter your Crafter.io Addon export!" })
        }


        const professions: CharacterProfession[] = []
        let partialCharacter: Partial<Character>
        try {

            //Note this is NOT a complete character. It will miss the id, realm.id, realm.slug, faction and level
            partialCharacter = JSON.parse(data.toString())



            if (!partialCharacter.professions) {
                throw new SyntaxError("Import is missing a professions field")
            }

            if (!partialCharacter.realm?.id) {
                return fail(400, { message: "Import is missing a realm id" })
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
        if (!token || !token.accessToken) {
            return fail(400, { professions: data, message: "Please relog" })
        }
        const user = await users.findOne<User>({ accountID: token?.sub })

        if (!user) {
            //TODO: Insert Update Characters Method HERE
            return fail(400, { professions: data, message: "Userdata Missing, try loging out and in again!" })
        }

        function findCharacter(characters: Partial<Character[]>, partialCharacter: Partial<Character>): Character | undefined {
            if (!characters) {
                return
            }
            const correctCharacterIndex = characters.findIndex(character => character && character.name === partialCharacter.name && character.realm.id === partialCharacter.realm?.id)
            return characters[correctCharacterIndex]
        }

        let correctCharacter = findCharacter(user.characters, partialCharacter)

        if (!correctCharacter) {
            const newCharacters = await getCharacters(user.region, token.accessToken)
            correctCharacter = findCharacter(newCharacters, partialCharacter)

            if (!correctCharacter) {
                return fail(400, { professions: data, message: "Could not find the associated character or fetch it from Blizzard. Try to log out and in again." })
            }

            const update = await updateCharacters(newCharacters, user.accountID)

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
                        { "profession.skillLineID": profession.skillLineID }
                    ]
                }
            )
            if (update.matchedCount <= 0) {
                return fail(400, { professions: data, message: "Database Error. If this persists, open an issue on GitHub, that contains your import string" })
            }
        }
        return { sucess: true }
    },
    updateProfessions: async (event) => {
        const token = await getToken(event.cookies)
        if (!token || !token.accessToken) {
            return fail(400, { message: "Please relog" })
        }
        const user = await users.findOne<User>({ accountID: token?.sub })
        if (!user) {
            //TODO: If the user does not exist there certainly is a BIG problem
            return fail(400, { message: "Userdata Missing, try loging out and in again!" })
        }

        const characters = await getCharacters(user.region, token.accessToken)

        if (user.characters.length < characters.length) {
            await updateCharacters(characters, user.accountID)

        }


        let newestDoc = user.characters
        for (const character of characters) {

            const professions = await getProfessions(user.region, character.realm.slug, character.name, token.accessToken)
            for (const profession of professions) {
                if (!characterProfessionSchema.safeParse(profession)) {
                    console.log("3")
                    return fail(400, { message: "Could not validate profession data, provided by Blizzard. If this error persists, please report it on GitHub." })
                }
            }
            if (!character.professions || character.professions.length == 0) {
                const update = await users.findOneAndUpdate(
                    {
                        accountID: user.accountID
                    },
                    {
                        $set: {
                            "characters.$[character].professions": professions
                        }
                    },
                    {
                        arrayFilters: [
                            { "character.id": character.id }
                        ],
                        returnDocument: "after"
                    }
                )
                if (!update.ok || !update.value) {
                    console.log("4")
                    return fail(400, { message: "Database Error. If this persists, open an issue on GitHub." })
                }
                newestDoc = update.value.characters
            } else {
                for (const profession of professions) {
                    if (!profession.recipes) {
                        console.log("5")
                        continue
                    }
                    const update = await users.findOneAndUpdate(
                        {
                            accountID: user.accountID
                        },
                        {
                            $set: {
                                "characters.$[character].professions.$[profession].recipes": profession.recipes
                            }
                        },
                        {
                            arrayFilters: [
                                { "character.id": character.id },
                                { "profession.skillLineID": profession.skillLineID }
                            ],
                            returnDocument: "after"
                        }
                    )
                    if (!update.ok || !update.value) {
                        console.log("6")
                        return fail(400, { message: "Database Error. If this persists, open an issue on GitHub." })
                    }
                    newestDoc = update.value.characters


                }
            }
        }
        return { characters: newestDoc, success: true }
    },
    
    //TODO: PROBLEM right now each character has it's own comission for every recipe. But if you got two characters that have the same recipe, the comission should be identical.
    updateCommission: async (event) => {
        const token = await getToken(event.cookies)

        const formData = await event.request.formData()

        const commissionString = formData.get("commission")?.toString()
        const recipeIDString = formData.get("recipeID")?.toString()
        const skillLineIDString = formData.get("skillLineID")?.toString()
        const characterIDString = formData.get("characterID")?.toString()

        if (!commissionString || !recipeIDString || !skillLineIDString || !characterIDString) {
            return fail(400, { commission: commissionString, message: "UpdateError, please try again!" })
        }

        const commission = parseInt(commissionString)
        const recipeID = parseInt(recipeIDString)
        const skillLineID = parseInt(skillLineIDString)
        const characterID = parseInt(characterIDString)


        const update = await users.updateOne({
            accountID: token?.sub
        },
            {
                $set: {
                    "characters.$[character].professions.$[profession].recipes.$[recipe].commission": commission
                }
            },
            {
                arrayFilters: [
                    { "character.id": characterID },
                    { "profession.skillLineID": skillLineID },
                    { "recipe.recipeID": recipeID }
                ]
            })

        if (update.modifiedCount == 0) {
            return fail(400, { commission: commission, message: "Update Failed, no data was changed" })
        }

        return { message: "Commission updated", commission: commission }
    },




} satisfies Actions