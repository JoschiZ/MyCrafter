export class PathNode {
    _id!: string
    name!: string
    pathDescription!: string
    children!: number[]
    target?: Target
    effects?: Effect[]
    perkInfos!: Perk[]
    pathID!: number
}


type Target = {
    all?: string[]
    any?: string[]
    recipes?: number[] //a list of recipe ids to specifically target. Takes precedent to all and any
}

type Perk = {
    unlockRank: number
    isMajorPerk: boolean
    perkID: number
    description: string
    effects?: Effect[]
    target?: Target //This is a override for the target set in the node itself
}

type Effect = {
    amount?: number,
    stat?: Stat,
    unit?: Unit
    modifyslots?: number[]
}

enum Stat {
    SKILL = "skill",
    MULTICRAFT = "multicraft",
    INSPIRATION = "inspiration",
    RESOURCEFULNESS = "resourcefulness"
}

enum Unit {
    PERCENT = "percent",
    POINT = "point"
}
