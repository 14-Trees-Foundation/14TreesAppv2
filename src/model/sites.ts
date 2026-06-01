
export type LocationSite = {
  id: number;
  location_name: string;
  display_name: string | null;
  location_type: string;
  location_path: string;
  parent_location_id: number | null;
  total_trees_count: number;
  area_acres: number;
  grove_type: string | null;
  land_type: string | null;
  maintenance_type: string | null;
  accessibility_status: string | null;
  photo_album: string | null;
}

export type Site = {
  local_id: number,
  id?: number,
  name_marathi: string;
  name_english: string;
  owner: string | null;
  land_type: string | null;
  land_strata: string | null;
  district: string | null;
  taluka: string | null;
  village: string | null;
  area_acres: number | null;
  length_km: number | null;
  tree_count: number | null;
  grove_type: string | null;
  site_data_check: string | null;
  is_uploaded: 0 | 1,
  change_type: 'none' | 'add' | 'edit' | 'delete',
  plot_count?: number | null,
  created_at: string;
  updated_at: string;
}

export type CreateSiteRequest = {
  name_marathi: string;
  name_english: string;
  owner: string | null;
  land_type: string | null;
  land_strata: string | null;
  district: string | null;
  taluka: string | null;
  village: string | null;
  area_acres: number | null;
  length_km: number | null;
  grove_type: string | null;
}

export type SiteHelperDataResponse = {
  total: number,
  sites: Site[],
  deleted_site_ids: number[]
}