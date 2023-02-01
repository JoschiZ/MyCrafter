import { StartMongo } from "$db/mongo";
import { SvelteKitAuth } from "@auth/sveltekit";
import BNet from "@auth/core/providers/battlenet"
import { BNET_TEST_ID, BNET_TEST_SECRET } from "$env/static/private";
import type { Profile } from "@auth/core/types";
import type { Provider } from "@auth/core/providers";
import { getCharacters } from "$lib/server/bnetapi/getCharacters";
import type { User } from "$db/user/type/User";
import users from "$db/user/users";
import { userSchema } from "$db/user/type/User.zod";

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
      name: "Battlenet-EU",
      id: "battlenet-eu",
      authorization: {
        params: {
          scope: "openid wow.profile",
        }
      },
    }) as Provider<Profile>,
    BNet({
      clientId: BNET_TEST_ID,
      clientSecret: BNET_TEST_SECRET,
      name: "Battlenet-US",
      issuer: "https://us.battle.net/oauth",
      id: "battlenet-us",
      authorization: {
        params: {
          scope: "openid wow.profile",
        }
      },
    }) as Provider<Profile>,
    BNet({
      clientId: BNET_TEST_ID,
      clientSecret: BNET_TEST_SECRET,
      name: "Battlenet-KR",
      issuer: "https://kr.battle.net/oauth",
      id: "battlenet-kr",
      authorization: {
        params: {
          scope: "openid wow.profile",
        }
      },
    }) as Provider<Profile>,
    BNet({
      clientId: BNET_TEST_ID,
      clientSecret: BNET_TEST_SECRET,
      name: "Battlenet-TW",
      issuer: "https://tw.battle.net/oauth",
      id: "battlenet-tw",
      authorization: {
        params: {
          scope: "openid wow.profile",
        }
      },
    }) as Provider<Profile>],

  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token to the token right after signin

      //TODO: The session should be either automatically renewed or completely deleted after it expires
      if (profile && account) {

        token.accessToken = account.access_token
        
        let region: "eu" | "us" | "kr" | "tw" | "cn" | undefined = undefined
        if (profile.iss === "https://eu.battle.net/oauth") {
          region = "eu"
        } else if (profile.iss === "https://us.battle.net/oauth") {
          region = "us"
        } else if (profile.iss === "https://kr.battle.net/oauth") {
          region = "kr"
        } else if (profile.iss === "https://tw.battle.net/oauth") {
          region = "tw"
        } else if (profile.iss === "https://www.battlenet.com.cn/oauth") {
          region = "cn"
        }

        token.region = region

        if (!region) {
          console.error("Region was undefined on first user");
          return token
        }

        if (await users.findOne({ accountID: account.providerAccountId })) {
          console.log("user was known")
          return token
        }

        console.log("was new user")
        const characters = await getCharacters(region, account.access_token as string)
        const newUser: User = {
          accountID: account.providerAccountId,
          battleTag: token.name as string,
          creationDate: new Date(),
          region: region,
          characters: characters
        }

        if (!userSchema.safeParse(newUser)) {
          console.error("User could not be validated!");
        }

        await users.insertOne(newUser)


        return token
      }
    },
  }
})