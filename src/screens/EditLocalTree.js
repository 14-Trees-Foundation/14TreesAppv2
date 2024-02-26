import React, { useEffect, useState } from 'react';
import { Button, Text, TextInput, ToastAndroid, View } from 'react-native';
import { DataService } from '../services/DataService';
import { Strings } from '../services/Strings';
import { TreeForm, treeFormModes } from '../components/TreeForm';
import { Constants, Utils } from '../services/Utils';
import { MyIconButton } from '../components/Components';
import LoadingScreen from './LoadingScreen';

const fetchTreeDetails = async (saplingId, setDetails) => {
    // console.log('fetching tree details');    
    const treeDetails = await Utils.fetchLocalTree(saplingId);
    //console.log("treeDetails: ", treeDetails);
    if (!treeDetails) { return; }
    const detailsForTreeForm = { ...Constants.treeFormTemplateData };
    const treeType = await Utils.treeTypeFromID(treeDetails.type_id);
    const plot = await Utils.plotFromPlotID(treeDetails.plot_id);
    detailsForTreeForm.inImages = treeDetails.images;
    detailsForTreeForm.inLat = 0;
    detailsForTreeForm.inLng = 0;
    detailsForTreeForm.inLat = Number.parseFloat(treeDetails.coordinates[0]);
    detailsForTreeForm.inLng = Number.parseFloat(treeDetails.coordinates[1]);
    detailsForTreeForm.inSaplingId = treeDetails.sapling_id;
    detailsForTreeForm.inTreeType = treeType;
    detailsForTreeForm.inPlot = plot;
    detailsForTreeForm.inUserId = treeDetails.user_id;
    // console.log('details:',detailsForTreeForm);
    setDetails(detailsForTreeForm);
}

export const EditLocalTree = ({ navigation, route }) => {
    const { sapling_id } = route.params;
    const [saplingid, setSaplingid] = useState(sapling_id);
    const [details, setDetails] = useState(null);
    useEffect(() => {
        setSaplingid(sapling_id);
    }, [sapling_id]);
    useEffect(() => {
        setDetails(null);
        fetchTreeDetails(saplingid, setDetails);
    }, [saplingid])
    const updateDetails = async (tree, images) => {
        console.log("tree received----- ",tree);
        console.log("images received----- ",images);
        if (tree.saplingid !== details.inSaplingId) {
            //delete tree by sapling ID
            await Utils.deleteTreeAndImages(details.inSaplingId);
        }
        await Utils.deleteTreeImages(tree.saplingid);
        await Utils.saveTreeAndImagesToLocalDB(tree, images);
        navigation.popToTop();
    }
    if (details) {
        return <TreeForm
            mode={treeFormModes.localEdit}
            treeData={details}
            onCancel={() => navigation.popToTop()}
            updateUserId={false}
            updateLocation={false}
            onVerifiedSave={updateDetails}
        />
    }
    else {
        return (
            <LoadingScreen />
        )
    }
}