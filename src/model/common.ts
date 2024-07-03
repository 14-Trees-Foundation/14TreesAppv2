
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