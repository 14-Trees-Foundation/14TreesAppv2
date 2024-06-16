import { View, Text, Modal, StyleSheet, Dimensions, ScrollView, ToastAndroid, Alert } from 'react-native';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Utils, Constants } from '../services/Utils';
import { Strings } from '../services/Strings';
import GlobalContext from '../context/GlobalContext ';
import { treeFormModes } from './TreeForm';
import { TreeFormModal } from './TreeFormModal';
import LoadingScreen from '../screens/LoadingScreen';
import { customModalStyles } from '../services/Styles';

const AddTreeModal = ({ modalVisible, setModalVisible, mode, onFetchData, saplingID, finalShiftData }) => {
    const { setPlaySound, setTreesPlanted, treesPlanted, plotSelected, setPlotSelected, shiftID, lightTheme } = useContext(GlobalContext);


    const [details, setDetails] = useState(null);

    const saveShiftsAndTreesToDB = async (saplingId) => {

        const endtime = Utils.getCurrentTime12Hr();
        const timetaken = Utils.formatTime(finalShiftData.current.seconds);
        const user_id = await Utils.getUserId();

        const sapling = {
            sapling_id: saplingId,
            sequence_no: (treesPlanted + 1),
            uploaded: 0,
        }

        const shiftData = {
            id: shiftID,
            user_id: user_id,
            plotselected: finalShiftData.current.plotselected,
            starttime: finalShiftData.current.shiftTime,
            endtime: endtime,
            shiftended: 0,
            shiftuploadcomplete: 0,
            timetaken: timetaken,
            treesplanted: finalShiftData.current.treesPlanted,
            sapling: sapling
        }


        console.log("final shift data add tree----", shiftData);
        await Utils.saveShiftsToLocalDB(shiftData);

    }

    async function onVerifiedSave(tree, images) {

        if (mode === treeFormModes.addTree) {
            setTreesPlanted(treesPlanted + 1);
            await Utils.saveTreeAndImagesToLocalDB(tree, images);
            setPlaySound(true);
            ToastAndroid.show(Strings.alertMessages.TreeSaved, ToastAndroid.SHORT);
            await saveShiftsAndTreesToDB(tree.saplingid);

        } else if (mode === treeFormModes.localEdit) {

            if (tree.saplingid !== details.inSaplingId) {
                await Utils.deleteTreeAndImages(details.inSaplingId); //delete tree by sapling ID
                //change sapling id in shift table also...
                await Utils.updateSaplingInShiftDB(tree.saplingid, details.inSaplingId, shiftID);
            }

            await Utils.deleteTreeImages(tree.saplingid);
            await Utils.saveTreeAndImagesToLocalDB(tree, images);
            onFetchData();
            let toastmsg = Strings.alertMessages.TreeUpdatedfirsthalf + saplingID + Strings.alertMessages.TreeUpdatedsecondhalf;
            ToastAndroid.show(toastmsg, ToastAndroid.LONG);
            setModalVisible(false);
        }
    }

    const fetchTreeDetails = async (saplingId) => {
      
        if (saplingId === null || saplingId === undefined) {
            ToastAndroid.show(`${Strings.alertMessages.UnableToFetch} ${saplingId} `, ToastAndroid.LONG);
            setModalVisible(false)
            return
        }
        const treeDetails = await Utils.fetchLocalTree(saplingId);
        //console.log("treeDetails: ", treeDetails);
        if (!treeDetails) {
            ToastAndroid.show(`${Strings.alertMessages.UnableToFetch} ${saplingId} `, ToastAndroid.LONG);
            setModalVisible(false);
            return;
        }

        if (treeDetails.type_id && treeDetails.plot_id && treeDetails.images && treeDetails.coordinates[0] && treeDetails.coordinates[1] && treeDetails.user_id) {
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

    const fetchDetails = async () => {

        if (mode === treeFormModes.localEdit && saplingID) {
            console.log('fetching the tree details in CustomModal--- local edit');
            setDetails(null);
            await fetchTreeDetails(saplingID);
        } else if (mode === treeFormModes.addTree && !saplingID) {
            console.log('fetching the tree details in CustomModal--- add tree');
            const inputTreeData = { ...Constants.treeFormTemplateData };
            inputTreeData.inPlot = plotSelected;
            setDetails(inputTreeData);
        }
    };

    useEffect(() => {
        if (modalVisible) {
            fetchDetails();
        }

    }, [modalVisible]);


    const handleDetailsChanges = () => {
        setModalVisible(false);
        const inputTreeData = { ...Constants.treeFormTemplateData };
        inputTreeData.inPlot = plotSelected;
        setDetails(inputTreeData);
        onFetchData();
    }



    if (details) {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={
                    modalVisible 
                }
                onRequestClose={handleDetailsChanges}
            >
                <ScrollView keyboardShouldPersistTaps="handled" style={customModalStyles.centeredView}>
                    <View style={customModalStyles.modalView}>

                        <TreeFormModal
                            treeData={details}
                            onVerifiedSave={onVerifiedSave}
                            mode={mode}
                            onCancel={handleDetailsChanges}
                        />
                    </View>
                </ScrollView>
            </Modal>
        );
    } else {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={
                    modalVisible 
                }
                onRequestClose={handleDetailsChanges} 
            >

                <View style={customModalStyles.loadingView}>
                    <LoadingScreen />
                </View>

            </Modal>
        );
    }

};

export default AddTreeModal;

