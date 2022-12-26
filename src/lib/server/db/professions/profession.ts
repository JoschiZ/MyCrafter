import type { ObjectId } from "mongodb";

export class Profession {
    _id: ObjectId
    name: string
    variantId: { expansion: number }[]
    icon: string

    constructor(
        id: ObjectId,
        name: string,
        variantIds: { expansion: number }[],
        icon: string
    ) {
        this._id = id
        this.name = name
        this.variantId = variantIds
        this.icon = icon
    }
}