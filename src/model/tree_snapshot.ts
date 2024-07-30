
export type TreeSnapshot = {
    local_id: number,
    id?: number,
    sapling_id: string,
    user_id: number,
    name: string,
    data: string,           // image data in case of local image
    image: string | null,   // Image url from live database
    image_date: string,
    tree_status: string,
    is_uploaded: 0 | 1,
    is_deleted: 0 | 1,
    created_at: string
}

export type CreateTreeSnapshotRequest = {
    name: string,
    data: string,
    image_date: string,
    tree_status: string,
}

export type DeltaChangesResponse = {
    total: number,
    tree_snapshots: TreeSnapshot[],
    deleted_tree_snapshot_ids: number []
}