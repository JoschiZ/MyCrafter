import { StartMongo } from "$db/mongo";
import { SvelteKitAuth } from "@auth/sveltekit";
import BNet from "@auth/core/providers/battlenet"
import { BNET_TEST_ID, BNET_TEST_SECRET, GITHUB_TEST_ID, GITHUB_TEST_SECRET } from "$env/static/private";
import GitHub from "@auth/core/providers/github"

StartMongo().then(() => {
    console.log("Mongo started")
}).catch((e) =>
    console.error(e)
)

export const handle = SvelteKitAuth({
    providers: [
        BNet({
            clientId: BNET_TEST_ID,
            clientSecret: BNET_TEST_SECRET,
            issuer: "https://eu.battle.net/oauth"
        }),
        GitHub({
            clientId: GITHUB_TEST_ID,
            clientSecret: GITHUB_TEST_SECRET
        })
    ]
})
