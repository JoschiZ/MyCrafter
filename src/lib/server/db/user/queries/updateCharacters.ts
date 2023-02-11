import type { Character } from "../UserModel";
import UserModel from "../UserModel";

/**
 * This Method keeps the intersection and pushes new elements. Deletes old members, that aren't present in the
 * @param characters A full list of characters
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
            }
        ]
    ).exec()

    return update
}