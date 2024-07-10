
export type Plots = {
  id: number;
  name: string;
  plot_id: string;
  tags?: string[];

  gat?: string;
  status?: string;
  land_type?: number;
  category: 'Public' | 'Foundation' | null;
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