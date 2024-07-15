import { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, Image, View, ToastAndroid, Modal, TouchableOpacity } from 'react-native';
import { Strings } from "../services/Strings";
import { Utils } from "../services/Utils";
import { CoordinateSetter } from "./CoordinateSetter";
import { CustomDropdown } from "./CustomDropdown";
import { CustomButtonStyles, commonStyles, customModalStyles, treeFormModalStyles } from "../services/Styles";
import Icon from 'react-native-vector-icons/Ionicons';
import GlobalContext from '../context/GlobalContext ';
import { Button } from 'react-native-paper';
import { shiftTypes } from '../screens/Shifts';
import { Checkbox } from 'react-native-paper';

const AddImageModal = ({ modalVisible, setModalVisible, finalShiftData, onFetchData }) => {

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
    const [checked, setChecked] = useState(false);
    const [galleryModalVisible, setGalleryModalVisible] = useState(false);

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
        setGalleryModalVisible(false);
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
            plot_selected: finalShiftData.current.plotselected,
            start_time: finalShiftData.current.shiftTime,
            end_time: endtime,
            shift_ended: 0,
            shift_upload_complete: 0,
            time_taken: timetaken,
            trees_planted: finalShiftData.current.treesPlanted,
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

        if (saplingid === "" || saplingid === null || plotSelected === null || (plotSelected && Object.keys(plotSelected).length === 0)) {
            Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.IncompleteFields);
            return;
        }
        else if (image === null && !checked) {
            Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.NoImage);
            return;
        }

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

        try {
            const tree = {
                sapling_id: saplingid,
                lat: lat,
                lng: lng,
                user_id: userId,
                image: image,
                inActive: checked ? 1 : 0,
                timestamp: new Date().toISOString()
            };
            //console.log("--------------new image for tree ss---------", tree);
            setSaplingId(null);
            setShowImage(false)
            setImage(null);
            setlat(0);
            setlng(0);
            setTreesPlanted(treesPlanted + 1)
            setPlaySound(true);
            setChecked(false)
            ToastAndroid.show(Strings.alertMessages.TreeSaved, ToastAndroid.SHORT);
            await Utils.saveNewImage(tree)
            await saveShiftsAndTreesToDB(tree.sapling_id);
            onFetchData();
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
            <ScrollView keyboardShouldPersistTaps="handled" style={{ ...customModalStyles.centeredView, marginTop: 200 }}>
                <View style={customModalStyles.modalView}>


                    <View
                        style={{
                            ...treeFormModalStyles.container,
                            backgroundColor: 'white',
                        }}>


                        <TextInput
                            defaultValue={saplingid}
                            style={[
                                commonStyles.txtInput,
                                treeFormModalStyles.saplingIdInput(lightTheme, saplingid),
                                {fontStyle:'italic'}
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

                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: "center" }}>
                            <Checkbox
                                status={checked ? 'checked' : 'unchecked'}
                                color='green'
                                onPress={() => {
                                    setChecked(!checked);
                                    setImage(null);
                                    setShowImage(false);
                                    setlat(0);
                                    setlng(0);
                                }}
                            />
                            <Text style={{ color: "black", marginLeft: 5, fontSize: 16 }}>{Strings.buttonLabels.DeadTreeCheck} </Text>
                        </View>

                        {!checked && <View style={{ ...treeFormModalStyles.imageContainer, marginTop: 5 }}>
                            <TouchableOpacity
                                style={{ ...treeFormModalStyles.imagePicker }}
                                onPress={() => {
                                    setGalleryModalVisible(true);
                                }}>
                                {!showImage ? (
                                    <View style={{ ...treeFormModalStyles.cameraIcon, }}>
                                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', margin: 10 }}>
                                            <Image
                                                source={require('../../assets/icon-plus.png')} style={{ width: 30, height: 30, opacity: 0.3 }}
                                            />
                                        </View>
                                        <View style={{
                                            flex: 1, alignItems: 'center',
                                            marginBottom: 50,
                                            // marginTop: 30 
                                        }}>
                                            <Image
                                                source={require('../../assets/icon-bw-camera.png')} style={{ width: 60, height: 60, opacity: 0.3 }}
                                            />
                                        </View>
                                    </View>

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
                        }


                        <Modal
                            animationType="fade"
                            transparent={true}
                            visible={galleryModalVisible}
                            onRequestClose={() => {
                                setGalleryModalVisible(false);
                            }}
                        >
                            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                <View style={{ backgroundColor: 'white', padding: 40 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 }}>
                                        <TouchableOpacity onPress={() => pickImage(0)} style={{
                                            backgroundColor: "#059636", padding: 6, borderRadius: 12, width: 120, alignItems: "center", height: 45, shadowColor: 'black',
                                            shadowOpacity: 0.8,
                                            elevation: 3,
                                            shadowRadius: 1,
                                            shadowOffset: { width: 1, height: 4 },
                                        }}>
                                            <Text style={{ color: "white", fontWeight: 'bold', fontSize: 22 }}> {Strings.buttonLabels.openCamera}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => pickImage(1)} style={{
                                            backgroundColor: "#059636", padding: 6, borderRadius: 12, width: 120, alignItems: "center", height: 45, shadowColor: 'black',
                                            shadowOpacity: 0.8,
                                            elevation: 3,
                                            shadowRadius: 1,
                                            shadowOffset: { width: 1, height: 4 }
                                        }}>
                                            <Text style={{ color: "white", fontWeight: 'bold', fontSize: 22 }}> {Strings.buttonLabels.openGallery}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity style={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }} onPress={() => setGalleryModalVisible(false)}  >
                                        <Icon name="close-circle" size={28} color="red" />
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </Modal>

                        {!checked && <View style={{marginTop: 15}}>
                            <CoordinateSetter
                                inLat={lat}
                                inLng={lng}
                                onSetLat={item => setlat(item)}
                                onSetLng={item => setlng(item)}
                            />
                            </View>
                        }

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
                                        disabled={saplingid === '' || (!checked && (image === null || !lat))}
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
        </Modal >
    )
}

export default AddImageModal;