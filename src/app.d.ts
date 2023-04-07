// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { User } from "$db/user/UserModel";

// and what to do when importing types
declare namespace App {
	// interface Error {}
	interface Locals {
		user: User
	}
	// interface PageData {}
	// interface Platform {}
}
