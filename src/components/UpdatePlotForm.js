import { View, TextInput, Modal, ScrollView, ToastAndroid, Alert, Text, TouchableOpacity } from 'react-native';
import React, { useState, useContext } from 'react';
import { Utils } from '../services/Utils';
import { Strings } from '../services/Strings';
import GlobalContext from '../context/GlobalContext ';
import { CustomButtonStyles, commonStyles, customModalStyles, shiftHeaderStyles, shiftStyles, treeFormModalStyles } from '../services/Styles';
import { Button } from 'react-native-paper';

const UpdatePlotForm = ({ onFetchData, finalShiftData }) => {
    const { setPlaySound, setTreesPlanted, treesPlanted, newPlotSelected, plotSelected, shiftID, lightTheme } = useContext(GlobalContext);

    const [saplingid, setSaplingId] = useState(null);

    const [existsInLocalDB, setExistsInLocalDB] = useState(false);
    const [existsInLiveDB, setExistsInLiveDB] = useState(true);

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

    const checkIfExists = async () => {

        if (saplingid == null) {
            return;
        }
        let existsLocally = await Utils.checkSaplinginUpdatePlotDB(saplingid);
        console.log("checking existsLocally---", existsLocally);
        if (existsLocally) {
            setExistsInLocalDB(true);
            return;
        }
        let existsInLive = await Utils.checkIfSaplingExistsInLiveDB(saplingid);
        console.log("checking existsInLive---", existsInLive);
        if (!existsInLive) {
            setExistsInLiveDB(false);
            return;
        }
    }

    async function onSave() {

        if (saplingid === "" || saplingid === null || plotSelected === null || newPlotSelected === null || (plotSelected && Object.keys(plotSelected).length === 0) ||
            (newPlotSelected && Object.keys(newPlotSelected).length === 0)) {
            Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.IncompleteFields);
            return;
        }

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

        //console.log("update plot data----", treeData);
        setTreesPlanted(treesPlanted + 1);
        await Utils.saveUpdatePlot(treeData);
        setPlaySound(true);
        setSaplingId(null);
        ToastAndroid.show(Strings.alertMessages.TreeSaved, ToastAndroid.SHORT);
        await saveShiftsAndTreesToDB(saplingid);
        onFetchData();
    }

    return (
        <View style={{...shiftStyles.buttonContainerOuter,marginTop: 0, }}>
            <View style={{ ...shiftStyles.buttonContainerInner, marginTop: 0, marginBottom: 2 }}>
                <View style={{ marginLeft: 12, marginTop: 3, flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                        defaultValue={saplingid}
                        style={[
                            commonStyles.txtInput,
                            treeFormModalStyles.saplingIdInput(lightTheme, saplingid),
                            { flex: 1, marginRight: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0, fontStyle: 'italic' } // Adjust margin as needed
                        ]}
                        placeholder={Strings.labels.SaplingId}
                        placeholderTextColor={'black'}
                        onChangeText={text => {
                            setExistsInLocalDB(false);
                            setExistsInLiveDB(true);
                            setSaplingId(text.trim());

                        }}
                        onBlur={checkIfExists}
                    />

                    <TouchableOpacity
                        onPress={onSave}
                        style={[
                            CustomButtonStyles.button,
                            {
                                borderTopLeftRadius: 0,
                                borderBottomLeftRadius: 0,
                                borderTopRightRadius: 10,
                                borderBottomRightRadius: 10,
                                paddingHorizontal: 20,
                                height: '100%',
                                justifyContent: 'center', // centers the text vertically
                                alignItems: 'center', // centers the text horizontally
                                backgroundColor: '#1D4ED8',
                                height: 50,
                                marginRight: 4,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                // Elevation for Android
                                elevation: 5,
                            }
                        ]}
                    >
                        <Text style={{ ...CustomButtonStyles.buttonLabel, paddingTop: 0 }}>
                            {Strings.buttonLabels.Submit}
                        </Text>
                    </TouchableOpacity>
                </View>

                {saplingid &&
                    existsInLocalDB ? (
                    <Text style={{ ...commonStyles.text5, color: 'red', fontWeight: 'bold', padding: 5 }}>
                        {saplingid} {Strings.alertMessages.alreadyExists}
                    </Text>
                ) : (
                    saplingid && !existsInLiveDB && (
                        <Text style={{ ...commonStyles.text5, color: 'red', fontWeight: 'bold', padding: 5 }}>
                            {saplingid} {Strings.alertMessages.doesNotExist}
                        </Text>
                    )
                )
                }
            </View>
        </View>
    );


};

export default UpdatePlotForm;

