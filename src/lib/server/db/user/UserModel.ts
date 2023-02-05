import { PathNode } from "$db/pathNodes/PathNodeModel";
import { Profession } from "$db/professions/ProfessionModel";
import type { Ref } from "@typegoose/typegoose";
import { prop, pre, getModelForClass } from "@typegoose/typegoose";


@pre<User>("save", function () {
    this.updatedAt = new Date()
})
export class User {
    @prop({ required: true, alias: "accountID" })
    _id!: string
    accountID!: string

    @prop({ required: true })
    battleTag!: string

    @prop({ default: new Date() })
    createdAt: Date = new Date()

    @prop()
    updatedAt?: Date

    @prop({ required: true })
    region!: "eu" | "us" | "kr" | "tw" | "cn"

    @prop({ required: true, type: () => Character, _id: false })
    characters!: Character[]
}

export class Character {
    @prop({ required: true })
    name!: string

    @prop({ required: true })
    realm!: Realm

    @prop({ required: true })
    characterID!: string

    @prop({ required: true })
    faction!: "HORDE" | "ALLIANCE"

    @prop({ required: true })
    level!: number

    @prop({ type: () => CharacterProfession, _id: false })
    professions?: CharacterProfession[]

    public get fullName() {
        return `${this.name}-${this.realm.name}`
    }
}

export class CharacterProfession {
    @prop({ required: true })
    name!: string

    @prop({ ref: Profession, type: String })
    skillLineID!: Ref<Profession, string>

    @prop({ type: () => UserRecipe })
    recipes?: UserRecipe[]

    @prop()
    progress?: ProfessionProgress
}


export class UserRecipe {
    @prop({ required: true })
    recipeID!: number

    @prop({ required: true })
    name!: string

    @prop({
        default: 1,
        min: 1
    })
    commission!: number
}

export class ProfessionProgress {
    @prop({ required: true, min: 0, max: 100 })
    skill!: number

    @prop({
        required: true,
        min: 0,
        max: 100
    })
    skillModifier!: number

    @prop({ type: () => PathNodeProgress, _id: false })
    pathNodes?: PathNodeProgress[]
}

export class PathNodeProgress {
    @prop({ required: true, ref: () => PathNode, type: () => String })
    pathNode!: Ref<PathNode, PathNode["_id"]>

    @prop({ required: true })
    currentRank!: number
}

export class Realm {
    @prop({ required: true })
    name!: string

    @prop({ required: true })
    id!: string

    @prop({ required: true })
    slug!: string
}

const UserModel = getModelForClass(User)
export default UserModel