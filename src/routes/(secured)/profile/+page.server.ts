import type { User } from '$db/user/type/User';
import users from '$db/user/users';
import { getToken } from '$lib/server/middleware/authjs-helper';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
    const session = await event.locals.getSession()
    const token = await getToken(event.cookies)

    const user = await users.findOne<User>({accountID:token?.sub}, {projection: {_id:0}})


    return {
        session: session,
        user: user
    };
}) satisfies PageServerLoad;