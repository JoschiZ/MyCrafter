import type { ParamMatcher } from "@sveltejs/kit"

export const match: ParamMatcher = (stringparam:string) => {
  return professions.has(stringparam.toLowerCase())
}

const professions = new Set([
    "alchemy",
    "blacksmithing",
    "leatherworking",
    "tailoring",
    "engineering",
    "enchanting",
    "jewelcrafting",
    "inscription"
])