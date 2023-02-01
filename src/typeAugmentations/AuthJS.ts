/// <reference types="@auth/sveltekit" />
export {}

declare module "@auth/core/types" {
  interface Profile {
    iss?: string
  }
}

declare module "@auth/core/jwt" {
    interface JWT {
        accessToken?: string
    }
}