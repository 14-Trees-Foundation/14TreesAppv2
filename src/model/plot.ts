
export type LocationPlot = {
  id: number;
  location_name: string;
  display_name: string | null;
  location_type: string;
  parent_location_id: number;
  location_path: string;
  total_trees_count: number;
  total_area_including_children: number;
  document_count: number;
  alert_count: number;
  old_plot_id?: number | null;
}

export type Plot = {
  local_id: number,
  id?: number;
  name: string;
  display_name: string | null;
  plot_id: string;
  category: 'Public' | 'Foundation' | null;
  tags: string | null;
  gat: string | null;
  status: string | null;
  boundaries: string | null;
  site_id: number | null;
  total_trees_count: number | null;
  is_uploaded: 0 | 1
  change_type: 'none' | 'add' | 'edit' | 'delete',
  created_at: string;
  updated_at: string;
}

export type CreatePlotRequest = {
  name: string;
  plot_id: string;
  tags: string | null;
  gat: string | null;
  category: 'Public' | 'Foundation' | null;
}

export const locationPlotToPlot = (lp: LocationPlot): Plot => ({
    local_id: lp.id,              // location_id — used for tree filter
    id: lp.old_plot_id ?? lp.id, // old plot server id — used for form submission
    name: lp.location_name,
    display_name: lp.display_name ?? null,
    plot_id: '',
    category: null,
    tags: null,
    gat: null,
    status: null,
    boundaries: null,
    site_id: lp.parent_location_id,
    total_trees_count: lp.total_trees_count ?? null,
    is_uploaded: 1 as 0 | 1,
    change_type: 'none' as const,
    created_at: '',
    updated_at: '',
});

export type PlotHelperDataResponse = {
  total: number,
  plots: Plot[],
  deleted_plot_ids: number[]
}