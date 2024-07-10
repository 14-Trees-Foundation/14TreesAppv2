
export type Sites = {
  
  id?: number,
  name_marathi: string | null;
  name_english: string | null;
  owner: string | null;
  land_type: string | null;
  land_strata: string | null;
  district: string | null;
  taluka: string | null;
  village: string | null;
  area_acres: number | null;
  length_km: number | null;
  tree_count: number | null;
  unique_id: string | null;
  photo_album: string | null;
  consent_letter: string | null;
  grove_type: string | null;
  consent_document_link:  string| null;
  google_earth_link: string|null;
  trees_planted: Number|null;
  account: string|null;
  data_errors: string|null;
  date_planted: Date|null;
  site_data_check: Enumerator|null;

  album: string | null;
  album_contains: string | null;
  tag: string | null;
  status: string | null;
  remark: string | null;
  hosted_at: string | null;

}

export type CreateSiteRequest = {
  name_marathi: string | null;
  name_english: string | null;
  owner: string | null;
  land_type: string | null;
  land_strata: string | null;
  district: string | null;
  taluka: string | null;
  village: string | null;
  area_acres: number | null;
  length_km: number | null;
  consent_letter: string | null;
  grove_type: string | null;
  consent_document_link:  string| null;
}