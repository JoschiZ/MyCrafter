
import { getModelForClass, prop } from "@typegoose/typegoose"
import type { Ref } from "@typegoose/typegoose"
import { Item } from "$db/items/ItemModel"


export class Recipe {
    @prop({ required: true, alias: "recipeID" })
    _id!: string
    recipeID!: string

    @prop({ type: () => [Reagent], _id: false })
    reagents?: Reagent[]

    @prop({ _id: false })
    modifiedSlots?: ModifiedSlot[]

    @prop({ ref: () => Item, type: () => String, required: true })
    result!: Ref<Item, string>
}

export class Reagent {
    @prop({ required: true })
    quantity!: number

    @prop({ ref: () => Item, type: () => String, required: true })
    item!: Ref<Item, string>
}


export class ModifiedSlot {
    @prop({ required: true })
    name!: string

    @prop({ required: true })
    slotID!: number
}

export default getModelForClass(Recipe)