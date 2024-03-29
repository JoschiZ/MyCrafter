/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
type Primitives = string | number | boolean | symbol

/**
 * Get all valid nested pathes of object
 */
export type AllProps<Obj, Cache extends Array<Primitives> = []> =
    Obj extends Primitives ? Cache : {
        [Prop in keyof Obj]:
        | [...Cache, Prop] // <------ it should be unionized with recursion call
        | AllProps<Obj[Prop], [...Cache, Prop]>
    }[keyof Obj]

type Head<T extends ReadonlyArray<any>> =
    T extends []
    ? never
    : T extends [infer Head]
    ? Head
    : T extends [infer Head, ...infer _]
    ? Head
    : never


type Tail<T extends ReadonlyArray<any>> =
    T extends []
    ? []
    : T extends [infer _]
    ? []
    : T extends [infer _, ...infer Rest]
    ? Rest
    : never

type Last<T extends ReadonlyArray<any>> = T['length'] extends 1 ? true : false


export type OmitBase<Obj, Path extends ReadonlyArray<any>> =
    Last<Path> extends true
    ? {
        [Prop in Exclude<keyof Obj, Head<Path>>]: Obj[Prop]
    } : {
        [Prop in keyof Obj]: OmitBase<Obj[Prop], Tail<Path>>
    }

// we should allow only existing properties in right order