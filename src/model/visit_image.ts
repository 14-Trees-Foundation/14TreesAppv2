
export type VisitImage = {
    local_id: number,
    visit_id: number,
    name: string,
    data: string,
    is_uploaded: 0 | 1,
    timestamp: string
}

export type CreateVisitImageRequest = {
    visit_id: number,
    name: string,
    data: string,
}