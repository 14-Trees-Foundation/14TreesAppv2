import { View, Text, Modal, StyleSheet, Dimensions, ScrollView, ToastAndroid, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Utils, Constants } from '../services/Utils';
import { Strings } from '../services/Strings';
import { CustomButton } from './Components';
const { height, width } = Dimensions.get('window');
import GlobalContext from '../context/GlobalContext ';
import { treeFormModes } from './TreeForm';
import { TreeFormModal } from './TreeFormModal';
import LoadingScreen from '../screens/LoadingScreen';
import { commonStyles } from '../services/Styles';
import { CustomDropdown } from './CustomDropdown';
import { stackNavRef } from '../App';




const CustomModal = ({ modalVisible, setModalVisible, mode, onFetchData, saplingID, finalShiftData }) => {
    const { setPlaySound, setShiftDone, setTreesPlanted, treesPlanted, plotSelected, setPlotSelected, shiftID, setShiftID, lightTheme } = useContext(GlobalContext);


    const [details, setDetails] = useState(null);
    const [plotItems, setPlotItems] = useState([]); //for plots

    const saveShiftsAndTreesToDB = async (saplingId) => {

        const endtime = Utils.getCurrentTime12Hr();
        const timetaken = Utils.formatTime(finalShiftData.current.seconds);
        const user_id = await Utils.getUserId();

        const sapling = {
            sapling_id : saplingId,
            sequence_no: (treesPlanted + 1),
            uploaded : 0,
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
            sapling : sapling
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
        // console.log('fetching tree details');    
        const treeDetails = await Utils.fetchLocalTree(saplingId);
        //console.log("treeDetails: ", treeDetails);
        if (!treeDetails) { return }

        const detailsForTreeForm = { ...Constants.treeFormTemplateData };
        const treeType = await Utils.treeTypeFromID(treeDetails.type_id);
        const plot = await Utils.plotFromPlotID(treeDetails.plot_id);
        detailsForTreeForm.inImages = treeDetails.images;
        // detailsForTreeForm.inLat = 0;
        // detailsForTreeForm.inLng = 0;
        detailsForTreeForm.inLat = Number.parseFloat(treeDetails.coordinates[0]);
        detailsForTreeForm.inLng = Number.parseFloat(treeDetails.coordinates[1]);
        detailsForTreeForm.inSaplingId = treeDetails.sapling_id;
        detailsForTreeForm.inTreeType = treeType;
        detailsForTreeForm.inPlot = plot;
        detailsForTreeForm.inUserId = treeDetails.user_id;
        setDetails(detailsForTreeForm);
    }

    const fetchDetails = async () => {
        //console.log('useEffect is called');

        if (mode === treeFormModes.localEdit && saplingID) {
            console.log('fetching the tree details in CustomModal--- local edit');
            setDetails(null);
            await fetchTreeDetails(saplingID);
        } else if (mode === treeFormModes.addTree && !saplingID) {
            console.log('fetching the tree details in CustomModal--- add tree');
            const inputTreeData = { ...Constants.treeFormTemplateData };
            inputTreeData.inPlot = plotSelected;
            setDetails(inputTreeData);
        } else if (mode === treeFormModes.plotSelect || mode === treeFormModes.startShift) {
            console.log('selecting plot---');
            let { plots } = await Utils.getLocalTreeTypesAndPlots();
            setPlotItems(plots);
        }
    };

    useEffect(() => {

        if (modalVisible) {
            fetchDetails();
        }

    }, [modalVisible]);


    async function hanldePlotChanges(cancel) {

        if (mode === treeFormModes.startShift) {
            if (cancel === 0) {
                setPlotSelected(null);
                setModalVisible(false);
                return;
            } else {
                if (plotSelected === null) {
                    Alert.alert(Strings.alertMessages.NoPlotSelected, Strings.alertMessages.SelectPlot);
                    return;
                }
                
                setShiftDone(false);
                const shiftData = {
                    user_id: await Utils.getUserId(),
                    plotselected: plotSelected.name,
                    shiftended: 0,
                    shiftuploadcomplete: 0,
                    starttime: Utils.getCurrentTime12Hr(),
                    endtime: Utils.getCurrentTime12Hr(),
                    timetaken: 0,
                    treesplanted: 0
                }
                console.log("starting shift and inserting into shift table--", shiftData);
                const autoGeneratedShiftId = await Utils.saveShiftsToLocalDB(shiftData);
                setShiftID(autoGeneratedShiftId);

                stackNavRef.current?.navigate(
                    Strings.screenNames.getString('Shift', Strings.english),
                );
                setModalVisible(false);
            }

        } else {
            await Utils.updateTreesWithChangedPlot(plotSelected.value,shiftID)
            if (plotSelected === null) {
                Alert.alert(Strings.alertMessages.NoPlotSelected, Strings.alertMessages.SelectPlot);
                return;
            }
            setModalVisible(false);
        }
    }

    const handleDetailsChanges = () => {
        setModalVisible(false);
        const inputTreeData = { ...Constants.treeFormTemplateData };
        inputTreeData.inPlot = plotSelected;
        setDetails(inputTreeData);
        onFetchData();
    }

    if (mode === treeFormModes.plotSelect || mode === treeFormModes.startShift) {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={
                    modalVisible //changesNeeded
                }
                onRequestClose={() => hanldePlotChanges(0)} // Add this line
            >
                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ ...styles.centeredViewPlot, marginTop: mode === treeFormModes.startShift ? 80 : 200 }}>
                    <View style={styles.modalViewPlot}>
                        <View style={{
                            backgroundColor: 'white',
                            padding: 2,
                            margin: 10,
                            borderRadius: 10, borderColor: '#ccc', borderWidth: 3,
                            width: '98%'
                        }}>
                            <Text style={{
                                ...commonStyles.textSync, color: lightTheme ? '#52525C' : 'black',
                                margin: 20, fontSize: 20, marginBottom: 10
                            }}>{Strings.messages.EnterPlotName}</Text>

                            <View style={{ margin: 8, marginTop: 0 }}>
                                <CustomDropdown
                                    initItem={plotSelected}
                                    items={plotItems}
                                    label={Strings.labels.SelectPlot}
                                    onSelectItem={(item) => {
                                        console.log("------plot item got-----", item);
                                        setPlotSelected(item);
                                    }}
                                />
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 30, marginTop: 15, marginBottom: 5 }}>

                                <CustomButton text={Strings.buttonLabels.cancel}
                                    onPress={() => hanldePlotChanges(0)} opacityStyle={{ backgroundColor: 'red' }} />

                                <CustomButton text={Strings.buttonLabels.Submit}
                                    onPress={() => hanldePlotChanges(1)} opacityStyle={{ backgroundColor: '#059636' }} />
                            </View>
                        </View>

                    </View>
                </ScrollView>
            </Modal>
        )
    }

    if (details) {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={
                    modalVisible //changesNeeded
                }
                onRequestClose={handleDetailsChanges}
            >
                <ScrollView keyboardShouldPersistTaps="handled" style={styles.centeredView}>
                    <View style={styles.modalView}>

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
                    modalVisible //changesNeeded
                }
                onRequestClose={handleDetailsChanges} // Add this line
            >

                <View style={styles.centeredViewLoading}>
                    <LoadingScreen />
                </View>

            </Modal>
        );
    }

};

export default CustomModal;

const styles = StyleSheet.create({
    centeredViewPlot: {
        marginTop: 200,
        backgroundColor: 'rgba(0,0,0,.5)',
        margin: 2
    },
    centeredView: {
        marginTop: 200,
        //backgroundColor: 'rgba(0,0,0,1)',
        // width: '100%',
        // height: '100%'
    },
    centeredViewLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 200,
        backgroundColor: 'rgba(0,0,0,.2)',
    },
    modalView: {
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 0,
        //padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalViewPlot: {

        height: '100%',
        backgroundColor: 'white',
        //borderRadius: 0,
        //padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
});