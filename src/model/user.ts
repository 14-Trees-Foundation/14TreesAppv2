
export type User = {
    local_id: number,
    id?: number,
    name: string,
    phone: string,
    email: string,
    birth_date: string | null,
    roles: string | null,
    pin: string | null,
    is_uploaded: 0 | 1,
    change_type: 'none' | 'add' | 'edit' | 'delete',
    created_at: string,
    updated_at: string
}

export type CreateUserRequest = {
    name: string,
    phone: string,
    email: string,
    birth_date: string | null
}

export type UserHelperDataResponse = {
    users: User[],
    deleted_user_ids: number[]
}