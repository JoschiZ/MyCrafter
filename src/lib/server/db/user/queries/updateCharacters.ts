import UserModel from "../UserModel";
import type { Character, User } from "../UserModel";
import type { DocumentType } from "@typegoose/typegoose";
import type { getCharacters } from "$lib/server/bnetapi/getCharacters";


/**
 * This Method keeps the intersection and pushes new elements. Deletes old members, that aren't present in the new character list.
 * If a User Document is available use {@link updateCharactersInUserDoc} instead
 * @param characters List of newly fetched characters, will serve as the source of truth
 * @param accountID The accountID for identification
 * @returns The updated UserDocument
 */
export async function updateCharacters(characters: Character[], accountID: string) {
    const update = await UserModel.findByIdAndUpdate(
        accountID,
        [
            {
                $set: {
                    characters: {
                        $filter: {
                            input: "$characters",
                            cond: {

                                $in: ["$$this._id", {
                                    $map: {
                                        input: characters,
                                        as: "character",
                                        in: "$$character._id"
                                    }
                                }]

                            }
                        }
                    }
                }
            },
            {
                $set: {
                    characters: {
                        $concatArrays: [
                            "$characters",
                            {
                                $filter: {
                                    input: characters,

                                    cond: {
                                        $not: {
                                            $in: ["$$this._id", "$characters._id"]
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            },
        ],
        {returnDocument: "after"}
    ).exec()

    return update
}

/**
 * Equivalent Function to {@link updateCharacters}, but does the Document Manipulation Server Side instead of updating in Mongo directly.
 * Does NOT Save to DB!
 * @param newCharacters List of newly fetched characters, will serve as the source of truth
 * @param user The user Document to modify
 * @returns The modified User Doc
 */
export function updateCharactersInUserDoc(newCharacters: Character[], user: DocumentType<User>): NonNullable<Awaited<ReturnType<typeof updateCharacters>>>{
    const oldCharsMap = new Map(user.characters.map((char, i) => [char._id, i]))

    const updatedChars = []

    for (const newCharacter of newCharacters){
        const oldChar = oldCharsMap.get(newCharacter._id)
        if (oldChar !== undefined){
            updatedChars.push(user.characters[oldChar])
        } else {
            updatedChars.push(newCharacter)
        }
    }

    user.characters = updatedChars
    return user
}