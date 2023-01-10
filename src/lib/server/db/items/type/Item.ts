export type Item = {
    type: string
    name: string
    id: number
    subclassID: number
    subType: string
    classID: number
    tradeSkillLineID: number
    wowCat: string
    inventoryType: string
    recipe: Recipe
}

export type Recipe = {
    recipeID: number
    reagents?: Reagent[]
    modifiedSlots?: ModifiedSlot[]
    name?: string
}

export type Reagent = {
    quantity: number,
    name: string,
    id: number
}

export type ModifiedSlot = {
    name: string,
    id: number
}