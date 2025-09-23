
export type SyncInfo = {
    local_id: number,
    id?: number,
    trees: string,
    tree_images: string,
    visit_images: string,
    users: string | null,
    visitor_data?: string | null,
    synced_at: string,
    upload_time: number | null,
    fetch_time: number | null,
    upload_error: string | null,
    fetch_error: string | null,
    is_uploaded: 0 | 1,
    change_type: 'none' | 'add' | 'edit' | 'delete',
    created_at: string,
    updated_at: string
}

export type CreateSyncInfoRequest = {
    trees: string,
    tree_images: string,
    visit_images: string,
    users: string | null,
    visitor_data?: string | null,
    synced_at: string,
    upload_time: number | null,
    fetch_time: number | null,
    upload_error: string | null,
    fetch_error: string | null,
}

export type DeltaChangesResponse = {
    total: number,
    sync_histories: SyncInfo[]
}