import { Profession } from "$db/professions/ProfessionModel"
import type { Ref } from "@typegoose/typegoose"
import { getModelForClass, prop } from "@typegoose/typegoose"

export class Item {
    @prop({ required: true })
    _id!: string

    @prop({ required: true })
    type!: string

    @prop({ required: true, index: true })
    name!: string

    @prop({ required: true })
    subclassID!: number

    @prop({ required: true })
    subType!: string

    @prop({ required: true })
    classID!: number

    @prop({ ref: () => Profession, type: () => String, required: true })
    tradeSkillLineID!: Ref<Profession, string>

    @prop({ required: true })
    wowCat!: string

    @prop({ required: true })
    inventoryType!: string
}

export default getModelForClass(Item)