export type User = {
    accountID: string
    battleTag: string
    creationDate: Date
    region: "eu" | "us" | "kr" | "tw" | "cn"
    characters: Character[]
}

export type Character = {
    professions?: CharacterProfession[]
    name: string
    id: number
    realm: Realm
    faction: "HORDE" | "ALLIANCE"
    level: number
}

export type Realm = {
    name: string
    id: number
    slug: string
}

export type CharacterProfession = {
    name: string
    skillLineID: number //The ID of the dragonflight skillline
    recipes?: UserRecipe[]
    progress?: ProfessionProgress
}

export type UserRecipe = {
    recipeID: number
    name: string
}

export type ProfessionProgress = {
    /**
     * @maximum 100
     */
    skill: number
    skillModifier: number
    pathNodes: PathNode[]
}

export type PathNode = {
    pathID: number
    currentRank: number
}