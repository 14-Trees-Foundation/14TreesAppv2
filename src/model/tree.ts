export type Tree = {
  sapling_id: number,
  tree_type: string,
  image: string,
  tree_location: string,

}

export type CreateTreeRequest = {
  sapling_id: number,
  tree_type: string,
  image: string,
  tree_location: string | null
}