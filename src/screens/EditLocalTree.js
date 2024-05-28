import React, { useContext, useEffect, useState } from 'react';
import {ScrollView, Button, Text, TextInput, ToastAndroid, View, BackHandler } from 'react-native';
import { DataService } from '../services/DataService';
import { Strings } from '../services/Strings';
import { TreeForm, treeFormModes } from '../components/TreeForm';
import { Constants, Utils } from '../services/Utils';
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
    // detailsForTreeForm.inShiftId = treeDetails.shiftID;
    // detailsForTreeForm.inSequenceNo = treeDetails.sequenceNo
    //console.log('details before editing:',detailsForTreeForm);
    setDetails(detailsForTreeForm);
}

export const EditLocalTree = ({ navigation, route }) => {
    const { sapling_id } = route.params;
    const [saplingid, setSaplingid] = useState(sapling_id);
    const [details, setDetails] = useState(null);


    useEffect(() => {

        console.log("inside local tree edit");
        const backAction = () => {
            navigation.goBack()
            return true; // Prevent default behavior (exit app)
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, [])

    useEffect(() => {
        setSaplingid(sapling_id);
    }, [sapling_id]);
    useEffect(() => {
        setDetails(null);
        fetchTreeDetails(saplingid, setDetails);
    }, [saplingid])

    const updateDetails = async (tree, images) => {
        //console.log("tree received----- ",tree);
        //console.log("images received----- ",images);
        console.log("updating the tree inside local edit tree----");
        navigation.goBack();

        let toastmsg = Strings.alertMessages.TreeUpdatedfirsthalf + saplingid + Strings.alertMessages.TreeUpdatedsecondhalf;
        ToastAndroid.show(toastmsg, ToastAndroid.LONG);

        if (tree.saplingid !== details.inSaplingId) {
            //delete tree by sapling ID
            await Utils.deleteTreeAndImages(details.inSaplingId);
        }
        await Utils.deleteTreeImages(tree.saplingid);
        await Utils.saveTreeAndImagesToLocalDB(tree, images);
        
    }

    if (details) {
        return (
            <ScrollView keyboardShouldPersistTaps='handled' style={{ flex: 1 }}>
                <TreeForm
                    mode={treeFormModes.localEdit}
                    treeData={details}
                    onCancel={() => navigation.goBack()}
                    onVerifiedSave={updateDetails}
                />
            </ScrollView>
        )
    }
    else {
        return (
            <LoadingScreen />
        )
    }
}