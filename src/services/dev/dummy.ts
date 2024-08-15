import { ToastAndroid } from "react-native";
import { CreateTreeRequest } from "../../model/tree";
import { CreateTreeImageRequest } from "../../model/tree_image";
import { DaoClient } from "../db/dao";
import { dummyImageData } from "./image_data";

const imageData = dummyImageData

export const generateDummyTrees = async (count: number, plantTypeId: number, plotId: number) => {
    
    let saplingId = 900001;
    const daoClient = await DaoClient.authenticate();
    const time = new Date().getTime();

    for (let i = 0; i < count; i++) {
        const sapling = 'd' + time.toString() + '-' +(saplingId + i).toString()
        const data: CreateTreeRequest = {
            sapling_id: sapling,
            plot_id: plotId,
            plant_type_id: plantTypeId,
            location: JSON.stringify({ type: 'Point', coordinates: [10, 10] }),
            planted_by: 'Dummy',
            tree_status: 'healthy',
            assigned_at: null,
            assigned_to: null,
            visit_id: null
        }

        const image: CreateTreeImageRequest = {
            sapling_id: sapling,
            name: sapling + '.jpg',
            data: imageData,
            type: 'tree_image',
            user_id: null,
            is_active: null 
        }

        await daoClient.trees.createTree(data);
        await daoClient.treeImages.upsertTreeImage(image);
    }
    ToastAndroid.show('Dummy trees added!', ToastAndroid.LONG);

}

export const deleteDummyTrees = async () => {

    const daoClient = await DaoClient.authenticate();
    await daoClient.trees.deleteDummyTree()
    ToastAndroid.show('Dummy trees deleted!', ToastAndroid.LONG);
}