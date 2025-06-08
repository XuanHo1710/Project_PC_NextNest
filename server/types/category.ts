export interface TypeQueryCategory {
    sort?: string,
    filter?: string,
    search?: string
}

export interface TypeUpdateManyCategory {
    ids: Array<string>
    typeUpdate: string
}