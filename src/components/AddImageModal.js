import { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, Image, View, ToastAndroid, Modal, TouchableOpacity } from 'react-native';
import { Strings } from "../services/Strings";
import { Utils } from "../services/Utils";
import { CoordinateSetter } from "./CoordinateSetter";
import { CustomDropdown } from "./CustomDropdown";
import { CustomButtonStyles, commonStyles, customModalStyles, treeFormModalStyles } from "../services/Styles";
import Icon from 'react-native-vector-icons/Ionicons';
import GlobalContext from '../context/GlobalContext ';
import { treeFormModes } from './TreeForm';
import { Button } from 'react-native-paper';
import { shiftTypes } from '../screens/Shifts';

export const AddImageModal = ({ modalVisible, setModalVisible, finalShiftData, onFetchData }) => {

    const { setPlaySound, lightTheme, setTreesPlanted, treesPlanted, plotSelected, shiftType, shiftID, } = useContext(GlobalContext);
    const [saplingid, setSaplingId] = useState(null);
    const [lat, setlat] = useState(null);
    const [lng, setlng] = useState(null);
    // array of images
    const [image, setImage] = useState(null);
    const [showImage, setShowImage] = useState(false);

    const [userId, setUserId] = useState(null);

    const [existsInLocalDB, setExistsInLocalDB] = useState(false);
    const [existsInLiveDB, setExistsInLiveDB] = useState(true);


    useEffect(() => {
        Utils.addTasks();
    }, []);


    const loadDataCallback = useCallback(async () => {

        try {
            if (shiftType === shiftTypes.addImage) {
                let userId = await Utils.getUserId();
                setUserId(userId);
            }
        } catch (error) {
            console.error(error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: 'happened while trying to fetch userId(loadDataCallback())',
                error: JSON.stringify(error),
                stackTrace: stackTrace,
            };
            await Utils.logException(JSON.stringify(errorLog));
        }
    }, []);

    useEffect(() => {
        loadDataCallback();
    }, []);


    const handleDeleteItem = async (name) => {
        console.log("successfully deleted the image");
        setShowImage(false);
        setImage(null);
    };


    const pickImage = async (selectionId) => {
        Utils.startTask();
        let newImage = await Utils.getImage(true, selectionId);
        if (newImage === undefined) return;
        newImage = await Utils.formatImageForSapling(newImage, saplingid);
        setImage(newImage);
        setShowImage(true);
        Utils.stopTask();
    };


    const saveShiftsAndTreesToDB = async (saplingId) => {

        const endtime = Utils.getCurrentTime12Hr();
        const timetaken = Utils.formatTime(finalShiftData.current.seconds);
        const user_id = await Utils.getUserId();

        console.log("finalShiftData---", finalShiftData);

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
        let existsLocally = await Utils.checkIfImageAddedAlready(saplingid);
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

    const onSave = async () => {

        let existsLocally = await Utils.checkIfImageAddedAlready(saplingid);

        if (existsLocally) {
            Alert.alert(Strings.alertMessages.invalidSaplingId,
                ' ' + Strings.alertMessages.imageAddedAlready + ' ' + Strings.labels.SaplingId + ' ' + saplingid);
            return;
        } else {
            let existsInLiveDB = await Utils.checkIfSaplingExistsInLiveDB(saplingid);

            if (!existsInLiveDB) {
                Alert.alert(
                    Strings.alertMessages.invalidSaplingId,
                    Strings.labels.SaplingId +
                    ' ' +
                    saplingid +
                    ' ' +
                    Strings.alertMessages.doesNotExist,
                );
                return;
            }

        }
        if (saplingid === null || plotSelected === null || (plotSelected && Object.keys(plotSelected).length === 0)) {
            Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.IncompleteFields);
            return;
        }
        else if (image === null) {
            Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.NoImage);
            return;
        }

        else {
            try {
                const tree = {
                    sapling_id: saplingid,
                    lat: lat,
                    lng: lng,
                    user_id: userId,
                    image: image,
                    timestamp: new Date().toISOString()
                };
                //console.log("--------------new image for tree---------", tree);
                setSaplingId(null);
                setShowImage(false)
                setImage(null);
                setlat(0);
                setlng(0);
                setTreesPlanted(treesPlanted + 1)
                setPlaySound(true);
                ToastAndroid.show(Strings.alertMessages.TreeSaved, ToastAndroid.SHORT);
                await Utils.saveNewImage(tree)
                await saveShiftsAndTreesToDB(tree.sapling_id);

            } catch (error) {
                console.error(error);
                const stackTrace = error.stack;
                const errorLog = {
                    msg: "happened while trying to save image fro tree in AddImageModal",
                    error: JSON.stringify(error),
                    stackTrace: stackTrace
                }
                await Utils.logException(JSON.stringify(errorLog));
            }
        };
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={
                modalVisible
            }
            onRequestClose={() => setModalVisible(false)}
        >
            <ScrollView keyboardShouldPersistTaps="handled" style={{ ...commonStyles.borderedDisplay, ...customModalStyles.centeredView }}>
                <View style={{ ...customModalStyles.modalView, marginTop: 4 }}>

                    <TextInput
                        defaultValue={saplingid}
                        style={[
                            commonStyles.txtInput,
                            treeFormModalStyles.saplingIdInput(lightTheme, saplingid),

                        ]}
                        placeholder={Strings.labels.SaplingId}
                        placeholderTextColor={'black'}
                        onChangeText={text => {
                            setExistsInLocalDB(false);
                            setExistsInLiveDB(true);
                            setSaplingId(text);

                        }}
                        onBlur={checkIfExists}
                    />

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



                    <View style={{ ...treeFormModalStyles.imageContainer, marginLeft: 4, marginTop: 4 }}>
                        <TouchableOpacity
                            style={{ ...treeFormModalStyles.imagePicker }}
                            onPress={() => {
                                pickImage(0);
                            }}>
                            {!showImage ? (
                                <Image
                                    source={require('../../assets/camera.png')}
                                    style={treeFormModalStyles.cameraIcon}
                                />
                            ) : (
                                <Image
                                    source={{
                                        uri: `data:image/jpeg;base64,${image.data}`,
                                    }}
                                    style={treeFormModalStyles.image}
                                />
                            )}

                            {showImage && (
                                <TouchableOpacity
                                    style={treeFormModalStyles.deleteButton}
                                    onPress={() =>
                                        Utils.confirmAction(
                                            () => handleDeleteItem(image.name),
                                            Strings.alertMessages.confirmDeleteImage,
                                        )
                                    }>
                                    <Image
                                        source={require('../../assets/icondelete.png')} // Replace with your delete icon image
                                        style={treeFormModalStyles.deleteIcon} // Adjust the icon dimensions and margin
                                    />
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                    </View>


                    <CoordinateSetter
                        inLat={lat}
                        inLng={lng}
                        onSetLat={item => setlat(item)}
                        onSetLng={item => setlng(item)}
                    />

                    <View style={CustomButtonStyles.container}>
                        <View style={CustomButtonStyles.buttonRow}>
                            <View style={CustomButtonStyles.buttonContainer}>
                                <Button
                                    mode="contained"
                                    buttonColor='red'
                                    labelStyle={CustomButtonStyles.buttonLabel}
                                    style={CustomButtonStyles.button}
                                    onPress={() => {
                                        setModalVisible(false)
                                        onFetchData()
                                    }}
                                >
                                    {Strings.buttonLabels.cancel}
                                </Button>

                            </View>
                            <View style={CustomButtonStyles.buttonContainer}>
                                <Button
                                    onPress={onSave}
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
            </ScrollView>
        </Modal >
    )
}