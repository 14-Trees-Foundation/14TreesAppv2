
export type Visit = {
  local_id: number,
  id?: number,
  visit_name: string,
  visit_date: string,
  site_id: number | null,
  visit_type: string,
  is_uploaded: 0 | 1,
  change_type: 'none' | 'add' | 'edit' | 'delete',
  created_at: string,
  updated_at: string
}

export type CreateVisitRequest = {
  visit_name: string,
  visit_date: string,
  site_id: number | null,
  visit_type: string,
}

export type VisitHelperDataResponse = {
  total: number,
  visits: Visit[],
  deleted_visit_ids: number[]
}