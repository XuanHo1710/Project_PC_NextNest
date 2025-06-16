export interface TypeQueryRole {
    sort?: string,
    filter?: string,
    search?: string
}

export interface TypeUpdateManyRole {
    ids: Array<string>
    typeUpdate: string
}