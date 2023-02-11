import { CharacterProfession, type Character, type User } from '$db/user/UserModel';
import UserModel from '$db/user/UserModel';
import { getToken } from '$lib/server/middleware/authjs-helper';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { getCharacters } from '$lib/server/bnetapi/getCharacters';
import { getProfessions } from '$lib/server/bnetapi/getProfessions';
import { updateCharacters } from '$db/user/queries/updateCharacters';
import logger from '$lib/server/logger';

export const load = (async (event) => {
    const token = await getToken(event.cookies)
    const user = await UserModel.findById(token?.sub).lean({virtuals:true, getters:true}).exec()

    return {
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

        let partialCharacter: Partial<Character>
        try {

            //Note this is NOT a complete character. It will miss the id, realm.id, realm.slug, faction and level
            partialCharacter = JSON.parse(data.toString())

            if (!partialCharacter.professions) {
                return fail(400, { message: "Import has no profession" })
            }

            if (!partialCharacter.realm?._id) {
                return fail(400, { message: "Import is missing a realm id" })
            }

        } catch (error) {
            if (error instanceof SyntaxError) {
                logger.debug("Error in updateProgress: ", error)
                return fail(400, { professions: data, message: "Validation of the input failed, please reexport your data" })
            }
            throw error
        }


        const token = await getToken(event.cookies)
        if (!token || !token.accessToken) {
            return fail(400, { professions: data, message: "Please relog" })
        }
        const user = await UserModel.findOne({ accountID: token?.sub }).lean({ virtuals: true }).exec() as User

        if (!user) {
            //TODO: Insert Update Characters Method HERE
            return fail(400, { professions: data, message: "Userdata Missing, try loging out and in again!" })
        }

        function findCharacter(characters: Partial<Character[]>, partialCharacter: Partial<Character>): Character | undefined {
            if (!characters) {
                return
            }
            const correctCharacterIndex = characters.findIndex(character => character && character.name === partialCharacter.name && character.realm._id === partialCharacter.realm?._id)
            return characters[correctCharacterIndex]
        }

        let correctCharacter = findCharacter(user.characters, partialCharacter)

        if (!correctCharacter) {
            const newCharacters = await getCharacters(user.region, token.accessToken)
            correctCharacter = findCharacter(newCharacters, partialCharacter)

            if (!correctCharacter) {
                return fail(400, { professions: data, message: "Could not find the associated character or fetch it from Blizard. Try to log out and in again." })
            }

            const update = await updateCharacters(newCharacters, user.accountID)

            if (update.matchedCount <= 0) {
                return fail(400, { professions: data, message: "Database Error. If this persists, open an issue on GitHub, that contains your import string" })
            }
        }



        if (!correctCharacter.professions) {
            const update = await UserModel.updateOne(
                {
                    _id: user.accountID
                },
                {
                    $set: {
                        "characters.$[character].professions": partialCharacter.professions
                    }
                },
                {
                    arrayFilters: [
                        { "character.name": partialCharacter.name, "character.realm.id": partialCharacter.realm._id }]
                }).exec()
            if (update.matchedCount <= 0) {
                return fail(400, { professions: data, message: "Database Error. If this persists, open an issue on GitHub, that contains your import string" })
            }
            return { sucess: true }
        }

        for (const profession of partialCharacter.professions) {
            const update = await UserModel.updateOne(
                {
                    _id: user.accountID
                },
                {
                    $set: {
                        "characters.$[character].professions.$[profession].progress": profession.progress
                    }
                },
                {
                    arrayFilters: [
                        { "character.name": partialCharacter.name, "character.realm.id": partialCharacter.realm._id },
                        { "profession.skillLineID": profession.skillLineID }
                    ]
                }
            ).exec()
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
        let user = await UserModel.findById(token.sub).lean({ virtuals: true }).exec()
        if (!user) {
            //TODO: If the user does not exist there certainly is a BIG problem
            return fail(400, { message: "Userdata Missing, try loging out and in again!" })
        }

        const characters = await getCharacters(user.region, token.accessToken)
        user = await updateCharacters(characters, user.accountID)

        if (!user){
            return fail(400, { message: "Userdata Missing, try loging out and in again!" })
        }

        let newestDoc = user.characters
        for (const character of user.characters) {

            const professions = await getProfessions(user.region, character.realm.slug, character.name, token.accessToken)
            
            // If the character has no professions we can just overwrite/update that field. Way easier query
            if (!character.professions || character.professions.length == 0) {                
                const update = await UserModel.findByIdAndUpdate(
                    user._id,
                    {
                        $set: {
                            "characters.$[character].professions": professions
                        }
                    },
                    {
                        arrayFilters: [
                            { "character._id": character._id }
                        ],
                        returnDocument: "after",
                    }
                ).lean({ virtuals: true, getters: true }).exec()

                if (!update) {
                    return fail(400, { message: "Database Error. If this persists, open an issue on GitHub." })
                }


                newestDoc = update.characters
            }
            else {
                for (const profession of professions) {
                    if (!profession.recipes) {
                        continue
                    }
                    const update = await UserModel.findByIdAndUpdate(

                        user.accountID,

                        {
                            $set: {
                                "characters.$[character].professions.$[profession].recipes": profession.recipes
                            }
                        },
                        {
                            arrayFilters: [
                                { "character._id": character._id },
                                { "profession.skillLineID": profession.skillLineID }
                            ],
                            returnDocument: "after"
                        }
                    ).lean().exec()
                    if (!update) {
                        return fail(400, { message: "Database Error. If this persists, open an issue on GitHub." })
                    }
                    newestDoc = update.characters
                }
            }
        }
        return { characters: newestDoc, success: true }
    },

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


        const update = await UserModel.updateOne(
            {
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
            }).exec()

        if (update.modifiedCount == 0) {
            return fail(400, { commission: commission, message: "Update Failed, no data was changed" })
        }

        return { message: "Commission updated", commission: commission }
    },




} satisfies Actions