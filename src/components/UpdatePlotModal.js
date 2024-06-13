import { View, TextInput, Modal, StyleSheet, Dimensions, ScrollView, ToastAndroid, Alert, Text } from 'react-native';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Utils, Constants } from '../services/Utils';
import { Strings } from '../services/Strings';
import GlobalContext from '../context/GlobalContext ';
import { treeFormModes } from './TreeForm';
import { TreeFormModal } from './TreeFormModal';
import LoadingScreen from '../screens/LoadingScreen';
import { CustomButtonStyles, commonStyles, customModalStyles, shiftHeaderStyles, treeFormModalStyles } from '../services/Styles';
import { Button } from 'react-native-paper';

const UpdatePlotModal = ({ modalVisible, setModalVisible, mode, onFetchData, finalShiftData }) => {
    const { setPlaySound, setShiftDone, setTreesPlanted, treesPlanted, newPlotSelected, plotSelected, shiftID, lightTheme } = useContext(GlobalContext);

    //const [details, setDetails] = useState(null);

    const [saplingid, setSaplingId] = useState(null);

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

    async function onVerifiedSave() {

        const isPresentinLiveDB = await Utils.checkIfSaplingExistsInLiveDB(saplingid);
        if (!isPresentinLiveDB) {
            Alert.alert(Strings.alertMessages.invalidSaplingId, Strings.labels.SaplingId +
                ' ' +
                saplingid +
                ' ' +
                Strings.alertMessages.doesNotExist,
            );
            setSaplingId(null);
            return;
        }

        const isPresent = await Utils.checkSaplinginUpdatePlotDB(saplingid);
        if (isPresent) {
            Alert.alert(Strings.alertMessages.invalidSaplingId, Strings.labels.SaplingId +
                ' ' +
                saplingid +
                ' ' +
                Strings.alertMessages.alreadyExists,
            );
            setSaplingId(null);
            return;
        }

        const treeData = {
            sapling_id: saplingid,
            new_plot: newPlotSelected.value,
            old_plot: plotSelected.value,
            user_id: await Utils.getUserId(),
            uploaded: 0,
            timestamp: new Date().toISOString()
        }

        console.log("update plot data----", treeData);
        setTreesPlanted(treesPlanted + 1);
        await Utils.saveUpdatePlot(treeData);
        setPlaySound(true);
        setSaplingId(null);
        ToastAndroid.show(Strings.alertMessages.TreeSaved, ToastAndroid.SHORT);
        await saveShiftsAndTreesToDB(saplingid);
    }

    const handleDetailsChanges = () => {
        setModalVisible(false);
        onFetchData();
    }



    // if (details) {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={
                modalVisible //changesNeeded
            }
            onRequestClose={handleDetailsChanges}
        >

            <ScrollView keyboardShouldPersistTaps="handled" style={customModalStyles.centeredView}>
                <View style={customModalStyles.modalView}>

                    <View style={treeFormModalStyles.container}>
                        
                        <View style={{ marginTop: 18, }}>
                            {newPlotSelected && <Text style={shiftHeaderStyles.plotName(lightTheme)}>
                                {newPlotSelected.name}
                            </Text>}
                        </View>

                        <View style={{ marginTop: 38, width: '100%' }}>
                            <TextInput
                                defaultValue={saplingid}
                                style={[
                                    commonStyles.txtInput,
                                    treeFormModalStyles.saplingIdInput(lightTheme, saplingid),
                                ]}
                                placeholder={Strings.labels.SaplingId}
                                placeholderTextColor={'black'}
                                onChangeText={text => {
                                    setSaplingId(text);
                                }}
                            />
                        </View>



                        <View style={{ ...CustomButtonStyles.container, marginTop: 30 }}>
                            <View style={CustomButtonStyles.buttonRow}>
                                <View style={CustomButtonStyles.buttonContainer}>
                                    <Button
                                        mode="contained"
                                        buttonColor='red'
                                        labelStyle={CustomButtonStyles.buttonLabel}
                                        style={CustomButtonStyles.button}
                                        onPress={handleDetailsChanges}
                                    >
                                        {Strings.buttonLabels.cancel}
                                    </Button>

                                </View>
                                <View style={CustomButtonStyles.buttonContainer}>
                                    <Button
                                        onPress={onVerifiedSave}
                                        mode="contained"
                                        buttonColor='#1D4ED8'
                                        labelStyle={CustomButtonStyles.buttonLabel}
                                        style={CustomButtonStyles.button}
                                    >
                                        {Strings.buttonLabels.Submit}
                                    </Button>
                                </View>
                            </View>
                        </View>

                    </View>

                </View>
            </ScrollView>
        </Modal>
    );


};

export default UpdatePlotModal;

