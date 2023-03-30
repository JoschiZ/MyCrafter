import { PathNode } from "$db/pathNodes/PathNodeModel";
import { getModelForClass, plugin, prop, PropType } from "@typegoose/typegoose";
import type { Ref } from "@typegoose/typegoose";
import { mongooseLeanVirtuals } from "mongoose-lean-virtuals"

@plugin(mongooseLeanVirtuals)
export class Profession {
    //** */
    @prop({ type: () => String, required: true, alias: "skillLineID" })
    _id!: string
    skillLineID?: string

    @prop({ type: () => String, })
    icon?: string

    @prop({ type: () => String, required: true })
    name!: string

    @prop({ required: true, type: () => Specialisation, _id: false }, PropType.ARRAY)
    specialisations!: Specialisation[]
}

export class Specialisation {
    @prop({ required: true, ref: () => PathNode, type: () => String })
    rootPathNode!: Ref<PathNode, PathNode["_id"]>

    @prop({ type: () => String, required: true })
    name!: string

    @prop({ type: () => String, required: true })
    description!: string

    @prop({ required: true, ref: () => PathNode, type: () => [String] }, PropType.ARRAY)
    paths!: Ref<PathNode, PathNode["_id"]>[]
}



export default getModelForClass(Profession)