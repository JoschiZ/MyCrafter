import type { Character } from "../type/User";
import users from "../users";

//TODO: This should techically also account for characters being deleted. But I guess max lvl chars being deleted is quite rare.
export async function updateCharacters(characters: Character[], accountID: string) {
    const update = await users.updateOne(
        {
            accountID: accountID
        },
        [{
            $set: {
                characters: {
                    $concatArrays: [
                        "$characters",
                        {
                            $filter: {
                                input: characters,

                                cond: {
                                    $not: {
                                        $in: ["$$this.id", "$characters.id"]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        }]
    )

    return update
}