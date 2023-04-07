import UserModel, { User } from "$db/user/UserModel";
import { getToken } from "$lib/server/middleware/authjs-helper";
import type { RequestEvent } from "@sveltejs/kit";

export async function authenticateUser(event: RequestEvent) {
    const session = await event.locals.getSession()
    
    if (!session){
        return null
    }

    const expiration = new Date(session?.expires)
    const currentTime = new Date()

    if (expiration < currentTime){
        return null
    }

    if (event.locals.user){
        return event.locals.user
    }


    const token = await getToken(event.cookies)
    const user = await UserModel.findById(token?.sub)

    return user
}