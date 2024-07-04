
export type User = {
    local_id: number,
    id?: number,
    name: string,
    phone: string,
    email: string,
    birth_date?: Date,
    is_uploaded: 0 | 1,
    change_type: 'none' | 'add' | 'edit' | 'delete',
    created_at: Date,
    updated_at: Date
}

export type CreateUserRequest = {
    name: string,
    phone: string,
    email: string,
    birth_date: string | null
}