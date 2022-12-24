import type { ParamMatcher } from "@sveltejs/kit"

export const match: ParamMatcher = (stringparam:string) => {
  return professions.has(stringparam)
}

const professions = new Set([
    "alchemy",
    "blacksmithing"
])