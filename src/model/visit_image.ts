
export type VisitImage = {
    local_id: number,
    id?: number,
    visit_id: number,
    name: string,
    data: string,
    image_url: string | null,
    is_uploaded: 0 | 1,
    created_at: string
}

export type CreateVisitImageRequest = {
    visit_id: number,
    name: string,
    data: string,
}

export type DeltaChangesResponse = {
    visit_images: VisitImage[],
    deleted_visit_image_ids: number []
}