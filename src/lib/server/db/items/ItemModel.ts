import { Profession } from "$db/professions/ProfessionModel"
import { getDiscriminatorModelForClass, index, plugin, type Ref } from "@typegoose/typegoose"
import { getModelForClass, prop } from "@typegoose/typegoose"
import { mongooseLeanVirtuals } from "mongoose-lean-virtuals"

@plugin(mongooseLeanVirtuals)
export class Item {
    @prop({ type: () => String, required: true, alias: "itemID" })
    _id!: string
    itemID: string = this._id

    @prop({ type: () => String, required: true })
    type!: string

    @prop({ type: () => String, required: true, index: true })
    name!: string

    @prop({ type: () => Number, required: true })
    subclassID!: number

    @prop({ type: () => String, required: true })
    subType!: string

    @prop({ type: () => Number, required: true })
    classID!: number

    @prop({ type: () => String, required: true })
    wowCat!: string

    @prop({ type: () => String, required: true })
    inventoryType!: string
}

export class CraftedItem extends Item {
    @prop({ type: () => Recipe, required: true })
    recipe!: Recipe

    @prop({ ref: () => Profession, type: () => String, required: true })
    tradeSkillLineID!: Ref<Profession, string>
}

@index({ recipeID: 1 }, { unique: true })
export class Recipe {
    @prop({type: () => String, required:true})
    name!: string

    @prop({ type: () => String, required: true, alias:"recipeID" })
    _id!: string
    recipeID: string = this._id

    @prop({ type: () => [Reagent], _id: false })
    reagents?: Reagent[]

    @prop({ type: () => [ModifiedSlot], _id: false })
    modifiedSlots?: ModifiedSlot[]

    @prop({ ref: () => Item, type: () => String})
    result?: Ref<Item, string>
}

export class Reagent {
    @prop({ type: () => Number, required: true })
    quantity!: number

    @prop({ ref: () => Item, type: () => String, required: true })
    item!: Ref<Item, string>
}


export class ModifiedSlot {
    @prop({ type: () => String, required: true })
    name!: string

    @prop({ type: () => Number, required: true })
    slotID!: number
}

const ItemModel = getModelForClass(Item)
export const CraftedItemModel = getDiscriminatorModelForClass(ItemModel, CraftedItem)