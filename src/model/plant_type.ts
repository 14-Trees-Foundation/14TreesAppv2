
export type PlantType = {
  id: number;
  name: string;
}

export type PlantTypeDeltaChangesResponse = {
  total: number,
  plant_types: PlantType[],
  deleted_plant_type_ids: number[]
}