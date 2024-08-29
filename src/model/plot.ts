
export type Plot = {
  local_id: number,
  id?: number;
  name: string;
  plot_id: string;
  category: 'Public' | 'Foundation' | null;
  tags: string | null;
  gat: string | null;
  status: string | null;
  boundaries: string | null;
  site_id: number | null;
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

export type PlotHelperDataResponse = {
  total: number,
  plots: Plot[],
  deleted_plot_ids: number[]
}