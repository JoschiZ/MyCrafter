import { StartMongo } from "$db/mongo";
import { SvelteKitAuth } from "@auth/sveltekit";
import BNet from "@auth/core/providers/battlenet"
import { BNET_TEST_ID, BNET_TEST_SECRET } from "$env/static/private";

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
            issuer: "https://eu.battle.net/oauth",
            authorization: {
                params: {
                  scope: "openid wow.profile"
                }
              },
        }),],
        callbacks: {
          async jwt({ token, account }) {
            // Persist the OAuth access_token to the token right after signin
            if (account) {
              token.accessToken = account.access_token
            }
            return token
          },
          async session({ session, token }) {
            // Send properties to the client, like an access_token from a provider.
            session.accessToken = token.accessToken
            return session
          }
        },

})
