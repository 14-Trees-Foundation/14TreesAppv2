
export type User = {
    id: number,
    name: string,
    phone: string,
    email: string,
    birth_date: Date,
    created_at: Date,
    updated_at: Date
}

export type CreateUserRequest = {
    name: string,
    phone: string,
    email: string,
    birth_date: string | null
}