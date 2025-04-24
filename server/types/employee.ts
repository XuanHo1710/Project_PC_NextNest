export interface TypeQueryEmployee {
    sort?: string,
    filter?: string,
    search?: string
}

export interface TypeUpdateManyEmployee {
    ids: Array<string>
    typeUpdate: string
}