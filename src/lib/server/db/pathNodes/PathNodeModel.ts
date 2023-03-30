import { getModelForClass, plugin, prop, PropType, type Ref } from "@typegoose/typegoose"
import { mongooseLeanVirtuals } from "mongoose-lean-virtuals"


@plugin(mongooseLeanVirtuals)
export class PathNode {
    @prop({ type: () => String, required: true, alias: "nodeID" })
    _id!: string
    pathID?: string

    @prop({ type: () => String, required: true })
    name!: string

    @prop({ type: () => String, required: true })
    pathDescription!: string

    @prop({ type: () => [String], required: true, ref: () => PathNode }, PropType.ARRAY)
    children!: Ref<PathNode, PathNode["_id"]>[]

    @prop({ type: () => Target, _id: false })
    target?: Target

    @prop({ type: () => [Effect], _id: false }, PropType.ARRAY)
    effects?: Effect[]

    @prop({ type: () => [PerkInfo], required: true}, PropType.ARRAY)
    perkInfos!: PerkInfo[]
}

class Target {
    @prop({ type: () => String }, PropType.ARRAY)
    all?: string[]

    @prop({ type: () => String }, PropType.ARRAY)
    any?: string[]

    @prop({ type: () => Number }, PropType.ARRAY)
    recipes?: number[] //a list of recipe ids to specifically target. Takes precedent to all and any
}

class PerkInfo {
    @prop({ type: () => Number, required: true })
    unlockRank!: number

    @prop({ type: () => Boolean, required: true })
    isMajorPerk!: boolean

    @prop({ type: () => Number, index: true, required: true, alias: "perkID" })
    _id!: number
    perkID?: number

    @prop({ type: () => String, required: true })
    description!: string

    @prop({ type: () => Effect, _id: false }, PropType.ARRAY)
    effects?: Effect[]

    @prop({ type: () => Target, _id: false })
    target?: Target //This is a override for the target set in the node itself
}

export enum Stat {
    SKILL = "skill",
    MULTICRAFT = "multicraft",
    INSPIRATION = "inspiration",
    RESOURCEFULNESS = "resourcefulness"
}

export enum Unit {
    PERCENT = "percent",
    POINT = "point"
}

class Effect {
    @prop({ type: () => Number })
    amount?: number

    @prop({ type: () => String, enum: Stat, _id: false })
    stat?: Stat

    @prop({ type: () => String, enum: Unit, _id: false })
    unit?: Unit

    @prop({ type: () => [Number] }, PropType.ARRAY)
    modifyslots?: number[]
}



export default getModelForClass(PathNode)
