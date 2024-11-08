
export type PaginatedResponse<T> = {
    offset: number,
    total: number,
    results: T[]
}

export type FilterItem = {
    columnField: string,
    value: any,
    operatorField: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'isEmpty' | 'isNotEmpty'
}

export type Image = {
    name: string,
    data: string
}

export type ImageSource = {
    description?: string,
    name?: string,
    data?: string,
    uri?: string,
    id?: number
}