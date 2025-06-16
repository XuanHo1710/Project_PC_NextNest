export interface TypeQueryAccountEmployee {
    sort?: string,
    filter?: string,
    search?: string
}

export interface TypeUpdateManyAccountEmployee {
    ids: Array<string>
    typeUpdate: string
}