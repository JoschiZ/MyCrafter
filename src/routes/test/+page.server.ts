import UserModel, { User } from "$db/user/UserModel";
import { getModelForClass, isDocument, isRefType, prop, type Ref } from "@typegoose/typegoose";

const user = await UserModel.findOne().exec()

class TestClass {
    @prop({type: () => String, ref:() => ARefClass})
    ref?: Ref<ARefClass, string>

    @prop({type: () => String})
    test?: string
}

class ARefClass {
    @prop({type: () => String, required:true})
    _id!: string
}

const TestModel = getModelForClass(TestClass)

const leanDocument = await TestModel.findOne().lean().exec()

let leanBase: unknown

if(leanDocument && typeof leanDocument.ref === "string"){
    leanBase = leanDocument
}
