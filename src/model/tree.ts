
export type Tree = {
    local_id: number;
    id: number | null;
    sapling_id: string;
    plant_type_id: number;
    plot_id: number;
    image: string | null;
    tags: string | null;
    location: string | null;
    planted_by: string | null;
    mapped_to_user: number | null;
    mapped_to_group: number | null;
    mapped_at: string | null;
    sponsored_by_user: number | null;
    sponsored_by_group: number | null;
    gifted_by: number | null;
    gifted_to: number | null;
    assigned_at: string | null;
    assigned_to: number | null;
    user_tree_image: string | null;
    user_card_image: string | null;
    description: string | null;
    event_id: number | null;
    memory_images: string | null;
    tree_status: 'alive' | 'dead' | 'lost';
    is_uploaded: 0 | 1;
    change_type: 'none' | 'add' | 'edit' | 'delete';
    created_at: string | null;
    updated_at: string | null;
}

export type CreateTreeRequest = {
    sapling_id: string;
    plant_type_id: number;
    plot_id: number;
    location: string; // { type: 'Point', coordinates: number[] }
    planted_by: string;
    tree_status: 'alive' | 'dead' | 'lost';
    assigned_at: string | null;
    assigned_to: number | null;
}

export type TreeHelperDataResponse = {
    total: number,
    trees: Tree[],
    deleted_tree_ids: number[]
}