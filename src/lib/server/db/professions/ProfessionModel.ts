import { PathNode } from "$db/pathNodes/PathNodeModel";
import { getModelForClass, prop } from "@typegoose/typegoose";
import type { Ref } from "@typegoose/typegoose";


export class Profession {
    //** */
    @prop({required: true, alias: "skillLineID"})
    _id!: string
    skillLineID!: string

    @prop()
    icon?: string

    @prop({required: true})
    name!: string

    @prop({required: true, type: () => Specialisation, _id:false})
    specialisations!: Specialisation[]


}

export class Specialisation {
    @prop({ required: true, ref: () => PathNode, type: () => String })
    rootPathNode!: Ref<PathNode, PathNode["_id"]>

    
    @prop({required: true})
    name!: string

    
    @prop({required: true})
    description!: string

    
    @prop({required: true, ref: () => PathNode, type: () => String})
    paths!: Ref<PathNode, PathNode["_id"]>[]
}






export default getModelForClass(Profession)