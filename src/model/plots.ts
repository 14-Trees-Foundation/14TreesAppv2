
export type Plots = {
  
  local_id: number,
  id?: number;
  name: string;
  plot_id: string;
  tags?: string[];

  gat?: string;
  status?: string;
  land_type?: number;
  category: 'Public' | 'Foundation' | null;
  is_uploaded: 0 | 1,
  change_type: 'none' | 'add' | 'edit' | 'delete',
  created_at: Date;
  updated_at: Date;
  site_id: number | null;
}

export type CreatePlotRequest = {
  name: string;
  plot_id: string;
  tags?: string[];
  gat?: string;
  status?: string;
  land_type?: number;
  category: 'Public' | 'Foundation' | null;
  site_id: number | null;

}

export type PlotHelperDataResponse = {
  plots: Plots[],
  deleted_plots_ids: number[]
}