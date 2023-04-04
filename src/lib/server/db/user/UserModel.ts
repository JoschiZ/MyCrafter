import { PathNode } from "$db/pathNodes/PathNodeModel";
import { Profession } from "$db/professions/ProfessionModel";
import { plugin, PropType, type Ref } from "@typegoose/typegoose";
import { prop, pre, getModelForClass } from "@typegoose/typegoose";
import { mongooseLeanGetters } from "mongoose-lean-getters"
import { mongooseLeanVirtuals } from "mongoose-lean-virtuals"

@plugin(mongooseLeanVirtuals)
@plugin(mongooseLeanGetters)
@pre<User>("save", function () {
    this.updatedAt = new Date()
})
export class User {
    @prop({ type: () => String, required: true, alias: "accountID" })
    _id!: string
    accountID!: string

    @prop({ type: () => String, required: true })
    battleTag!: string

    @prop({ type: () => Date, default: new Date() })
    createdAt: Date = new Date()

    @prop({ type: () => Date, })
    updatedAt?: Date

    @prop({ type: () => String, required: true })
    region!: "eu" | "us" | "kr" | "tw" | "cn"

    @prop({ required: true, type: () => [Character] }, PropType.ARRAY)
    characters!: Character[]
}

export class Character {
    @prop({ type: () => String, required: true })
    name!: string

    @prop({ type: () => Realm, required: true })
    realm!: Realm

    @prop({ type: () => String, required: true, alias: "characterID", index:true })
    _id!: string
    characterID: string = this._id

    @prop({ type: () => String, required: true })
    faction!: "HORDE" | "ALLIANCE"

    @prop({ type: () => Number, required: true })
    level!: number

    @prop({ type: () => [CharacterProfession], _id: false }, PropType.ARRAY)
    professions?: CharacterProfession[]

    public get fullName() {
        return `${this.name}-${this.realm.name}`
    }
}

export class CharacterProfession {
    @prop({ type: () => String, required: true })
    name!: string

    @prop({ ref: Profession, type: () => String })
    skillLineID!: Ref<Profession, string>

    @prop({ type: () => [UserRecipe], _id: false }, PropType.ARRAY)
    recipes?: UserRecipe[]

    @prop({ type: () => [ProfessionProgress], }, PropType.ARRAY)
    progress?: ProfessionProgress[]
}


export class UserRecipe {
    @prop({
        type: () => String,
        required:true,})
    name!: string

    @prop({type: () => String})
    recipeID?: string

    @prop({
        type: () => Number,
        default: 1,
        min: 1
    })
    commission = 1
}

export class ProfessionProgress {
    @prop({ type: () => Number, required: true, min: 0, max: 100 })
    skill!: number

    @prop({
        type: () => Number,
        required: true,
        min: 0,
        max: 100
    })
    skillModifier!: number

    @prop({ type: () => [PathNodeProgress], _id: false }, PropType.ARRAY)
    pathNodes?: PathNodeProgress[]
}

export class PathNodeProgress {
    @prop({ required: true, ref: () => PathNode, type: () => String })
    pathNode!: Ref<PathNode, PathNode["_id"]>

    @prop({ type: () => Number, required: true })
    currentRank!: number
}

export class Realm {
    @prop({ type: () => String, required: true })
    name!: string

    @prop({ type: () => String, required: true, alias: "realmID" })
    _id!: string
    realmID: string = this._id

    @prop({ type: () => String, required: true })
    slug!: string
}

const UserModel = getModelForClass(User)
export default UserModel