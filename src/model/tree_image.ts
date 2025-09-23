export type TreeImageType = 'tree_image' | 'user_tree_image' | 'user_card_image' | 'tree_snapshot'

export type TreeImage = {
    local_id: number,
    sapling_id: string,
    name: string,
    data: string,
    type: TreeImageType,
    is_uploaded: 0 | 1,
    is_active: 0 | 1 | null,           // only in case of tree_snapshot
    user_id: number | null,     // only in case of tree_snapshot
    visit_id: number | null,
    timestamp: string
}

export type CreateTreeImageRequest = {
    sapling_id: string,
    name: string,
    data: string,
    type: TreeImageType,
    is_active: 0 | 1 | null,           // only in case of tree_snapshot
    user_id: number | null,     // only in case of tree_snapshot
    visit_id: number | null,
}