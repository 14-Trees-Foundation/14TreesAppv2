import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, Button, Text, TextInput, ToastAndroid, View, BackHandler } from 'react-native';
import { Strings } from '../services/Strings';
import { TreeForm, treeFormModes } from '../components/TreeForm';
import { Constants, Utils } from '../services/Utils';
import LoadingScreen from './LoadingScreen';

const fetchTreeDetails = async (saplingId, setDetails, navigation, shiftID) => {
    console.log('fetching tree details');
    if (saplingId === null || saplingId === undefined) {
        ToastAndroid.show(`${Strings.alertMessages.UnableToFetch} ${saplingId} `, ToastAndroid.LONG);
        setModalVisible(false)
        return
    }

    const treeDetails = await Utils.fetchLocalTree(saplingId);
    //console.log("treeDetails: ", treeDetails, typeof saplingId);
    if (!treeDetails) {
        navigation.goBack();
        ToastAndroid.show(`${Strings.alertMessages.UnableToFetch} ${saplingId} `, ToastAndroid.LONG);
        return;
    }

    if (treeDetaifetchTreeDetailsls.type_id && treeDetails.plot_id && treeDetails.images && treeDetails.coordinates[0] && treeDetails.coordinates[1] && treeDetails.user_id) {
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

        setDetails(detailsForTreeForm);
    } else {
        //delete the tree and show toast message to user
        navigation.goBack();
        ToastAndroid.show(`${Strings.alertMessages.CorruptedData} `, ToastAndroid.LONG);
        await Utils.deleteTreeAndImages(saplingId);
        //delete from the local shift table also
        await Utils.deleteSaplingShiftLocalDB(saplingId, shiftID);
        return;
    }
}

export const EditLocalTree = ({ navigation, route }) => {
    const { sapling_id, shiftID } = route.params;
    const [saplingid, setSaplingid] = useState(sapling_id);
    const [details, setDetails] = useState(null);

    console.log("sapling id and shiftID in edit local tree---", sapling_id, shiftID);

    useEffect(() => {

        console.log("inside local tree edit");
        const backAction = () => {
            navigation.goBack()
            return true; 
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, [])

    useEffect(() => {
        setSaplingid(sapling_id);
    }, [sapling_id]);

    useEffect(() => {
        setDetails(null);
        fetchTreeDetails(saplingid, setDetails, navigation, shiftID);
    }, [saplingid])

    const updateDetails = async (tree, images) => {
        //console.log("tree received----- ",tree);
        //console.log("images received----- ",images);
        console.log("updating the tree inside local edit tree----");
        if (tree.saplingid !== details.inSaplingId) {
            //delete tree by sapling ID
            await Utils.deleteTreeAndImages(details.inSaplingId);
            //change sapling id in shift table also...
            await Utils.updateSaplingInShiftDB(tree.saplingid, details.inSaplingId, shiftID);
        }
        await Utils.deleteTreeImages(tree.saplingid);
        await Utils.saveTreeAndImagesToLocalDB(tree, images);
        navigation.goBack(); //so that the user sees the latest changed sapling id
        let toastmsg = Strings.alertMessages.TreeUpdatedfirsthalf + saplingid + Strings.alertMessages.TreeUpdatedsecondhalf;
        ToastAndroid.show(toastmsg, ToastAndroid.LONG);
    }

    if (details) {
        return (
            <ScrollView keyboardShouldPersistTaps='handled' style={{ flex: 1 ,backgroundColor:"white"}}>
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