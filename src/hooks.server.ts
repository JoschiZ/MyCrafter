import { StartMongo } from "$db/mongo";
import { SvelteKitAuth } from "@auth/sveltekit";
import BNet from "@auth/core/providers/battlenet"
import { BNET_TEST_ID, BNET_TEST_SECRET } from "$env/static/private";
import type { Profile } from "@auth/core/types";
import type { Provider } from "@auth/core/providers";
import { getCharacters } from "$lib/server/bnetapi/getCharacters";
import UserModel from "$db/user/UserModel";
import logger from "$lib/server/logger";
import { sequence } from "@sveltejs/kit/hooks";
import { redirect, type Handle } from "@sveltejs/kit";
import { authenticateUser } from "$lib/util/authenticateUser";


StartMongo().then(() => {
  logger.info("MongoDB Connected")
}).catch((e) =>
  logger.error("MongoConnectioFailed!", e)
)


const SKAuth = SvelteKitAuth({
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
    //@ts-expect-error Typing is just wrong here
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
          logger.error("User Login Failed!, Region was unknown")
          return token
        }


        if (await UserModel.countDocuments({ _id: account.providerAccountId }).exec() > 0) {
          logger.verbose("User was already present on login")
          return token
        }

        if (!account.access_token) {
          logger.warn("Could not fetch an access_token")
          return token
        }
        const characters = await getCharacters(region, account.access_token)

        await UserModel.create({ _id: account.providerAccountId, battleTag: token.name, region: region, characters: characters })

        return token
      }
    },
  }
})

const Authentication: Handle = async ({event, resolve}) => {
  event.locals.user = await authenticateUser(event)

  if (event.route.id?.includes("(secured)") && event.locals.user == null){
    throw redirect(301, "/login")
  }

  const response = await resolve(event)

  return response
} 

export const handle = sequence(SKAuth, Authentication)