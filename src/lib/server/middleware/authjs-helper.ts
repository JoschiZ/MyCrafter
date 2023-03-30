import { env as dynPriEnv } from '$env/dynamic/private';
import { decode } from '@auth/core/jwt';
import type { Cookies } from '@sveltejs/kit';

const secureCookie = dynPriEnv.NEXTAUTH_URL?.startsWith('https://') ?? !!dynPriEnv.VERCEL;
const cookieName = secureCookie ? '__Secure-next-auth.session-token' : 'next-auth.session-token';

/**
 * FIXME: Workaround to get the AuthJS issued jwt Token see: https://github.com/nextauthjs/next-auth/discussions/5595#discussioncomment-4628977
 * @param cookies 
 * @returns 
 */
export async function getToken(cookies: Cookies) {
	const token = cookies.get(cookieName);
	const decoded = await decode({ token, secret: dynPriEnv.AUTH_SECRET })
	
	if(decoded){
		return decoded
	}
}

