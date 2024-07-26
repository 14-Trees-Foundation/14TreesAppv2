
export type TreeSnapshot = {
    local_id: number,
    id?: number,
    sapling_id: string,
    user_id: number,
    name: string,
    data: string,
    image: string | null,
    is_uploaded: 0 | 1,
    created_at: string
}

export type DeltaChangesResponse = {
    total: number,
    tree_snapshots: TreeSnapshot[],
    deleted_tree_snapshot_ids: number []
}