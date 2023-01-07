export type Profession = {
    name: string
    icon: string
    skillLineID: number
    specialisations: Specialisation[]
}

export type Specialisation = {
    rootPathID: number
    name: string
    description: string
    paths: TalentPath[]
}

export type TalentPath = {
    name: string
    pathDescription: string
    children: number[]
    target?: Target
    effects?: Effect[]
    perkInfos: Perk[]
    pathID: number
}

export type Target = {
    all?: string[]
    any?: string[]
    recipes?: number[] //a list of recipe ids to specifically target. Takes precedent to all and any
}

export type Perk = {
    unlockRank: number
    isMajorPerk: boolean
    perkID: number
    description: string
    effects?: Effect[]
    target?: Target //This is a override for the target set in the node itself
}

export type Effect = {
    amount?: number,
    stat?: Stat,
    unit?: Unit
    modifyslots?: number[]
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