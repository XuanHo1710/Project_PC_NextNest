export interface TypeQueryProduct {
    sort?: string,
    filter?: string,
    search?: string
}

export interface TypeUpdateManyProduct {
    ids: Array<string>
    typeUpdate: string
}