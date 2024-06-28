import { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, Image, View, ToastAndroid, Modal, TouchableOpacity } from 'react-native';
import { Strings } from "../services/Strings";
import { Utils } from "../services/Utils";
import { CoordinateSetter } from "./CoordinateSetter";
import { CustomDropdown } from "./CustomDropdown";
import { CustomButtonStyles, commonStyles, treeFormModalStyles } from "../services/Styles";
import GlobalContext from '../context/GlobalContext ';
import { treeFormModes } from './TreeForm';
import { Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

export const TreeFormModal = ({ treeData, onVerifiedSave, mode, onCancel }) => {

    const { inSaplingId, inLng, inLat, inImages, inTreeType, inPlot, inUserId } = treeData;
    const [saplingid, setSaplingId] = useState(inSaplingId);
    const [lat, setlat] = useState(inLat);
    const [lng, setlng] = useState(inLng);
    // array of images
    const [images, setImages] = useState(inImages);
    const [showImage, setShowImage] = useState(false);

    const [treeItems, setTreeItems] = useState([]);
    const [selectedTreeType, setSelectedTreeType] = useState(inTreeType);
    const [selectedPlot, setSelectedPlot] = useState(null);
    const [userId, setUserId] = useState(inUserId);
    const [existsInLocalDB, setExistsInLocalDB] = useState(false);
    const [existsInLiveDB, setExistsInLiveDB] = useState(false);
    const [galleryModalVisible, setGalleryModalVisible] = useState(false);

    const { lightTheme } = useContext(GlobalContext);

    useEffect(() => {
        Utils.addTasks();
    }, []);

    useEffect(() => {
        if (mode === treeFormModes.localEdit) {
            if (treeData.inImages.length > 0) {
                setShowImage(true);
            }
        }
        setSelectedPlot(inPlot);
    }, [treeData])


    const loadDataCallback = useCallback(async () => {

        try {
            if (mode === treeFormModes.addTree) {
                let userId = await Utils.getUserId();
                setUserId(userId);
            }
            let { treeTypes } = await Utils.getLocalTreeTypesAndPlots();
            setTreeItems(treeTypes);
        } catch (error) {
            console.error(error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: 'happened while trying to fetch tree details from local db(loadDataCallback())',
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
        const newImages = images.filter((item) => item.name !== name);
        setImages(newImages);
    };

    const pickImage = async (selectionId) => {
        setGalleryModalVisible(false);
        Utils.startTask();
        let newImage = await Utils.getImage(true, selectionId);
        if (newImage === undefined) return;
        newImage = await Utils.formatImageForSapling(newImage, saplingid);
        setImages([newImage]);
        setShowImage(true);
        Utils.stopTask();
    };

    const checkIfExists = async () => {

        if (saplingid == null) {
            return;
        }
        let existsLocally = await Utils.checkIfSaplingExistsLocally(saplingid);
        console.log("checking existsLocally---", existsLocally);

        if (existsLocally) {
            setExistsInLocalDB(true);
            return;
        }
        let existsInLive = await Utils.checkIfSaplingExistsInLiveDB(saplingid);
        console.log("checking existsInLive---", existsInLive);
        if (existsInLive) {
            setExistsInLiveDB(true);
            return;
        }
    }

    const onSave = async () => {
        //console.log("saplingid----", saplingid);

        if (saplingid === "" || saplingid === null || selectedTreeType === null || selectedPlot === null || (selectedTreeType && Object.keys(selectedTreeType).length === 0) || (selectedPlot && Object.keys(selectedPlot).length === 0)) {
            Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.IncompleteFields);
            return;
        }
        else if (images.length === 0) {
            Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.NoImage);
            return;
        } else if (lat === 0 || lng === 0 || lat === null || lng === null) {
            Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.NoTreeLoaction);
            return;
        }

        if (mode === treeFormModes.addTree || (mode === treeFormModes.localEdit && inSaplingId !== saplingid)) {
            let existsLocally = await Utils.checkIfSaplingExistsLocally(saplingid);

            if (existsLocally) {
                Alert.alert(
                    Strings.alertMessages.invalidSaplingId,
                    Strings.labels.SaplingId +
                    ' ' +
                    saplingid +
                    ' ' +
                    Strings.alertMessages.alreadyExists,
                );
                return;
            } else {
                let existsInLive = await Utils.checkIfSaplingExistsInLiveDB(saplingid);
                if (existsInLive) {
                    Alert.alert(
                        Strings.alertMessages.invalidSaplingId,
                        Strings.labels.SaplingId +
                        ' ' +
                        saplingid +
                        ' ' +
                        Strings.alertMessages.alreadyExistsInDB,
                    );
                    return;
                }
            }
        }


        try {

            const tree = {
                treeid: selectedTreeType.value,
                saplingid: saplingid,
                lat: lat,
                lng: lng,
                plotid: selectedPlot.value,
                user_id: userId,
                timestamp: new Date().toISOString()
            };
            console.log("final tree data----", tree);
            setSaplingId(null);
            setSelectedTreeType(null);
            setShowImage(false)
            setImages([]);
            setlat(0);
            setlng(0);
            await onVerifiedSave(tree, images);

        } catch (error) {
            console.error(error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to save tree details in onSave() of TreeForm",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            await Utils.logException(JSON.stringify(errorLog));
        }

    }

    return (
        <ScrollView
            keyboardShouldPersistTaps='handled'
            scrollEnabled={true}
            style={{
                ...treeFormModalStyles.container, marginTop: 10, backgroundColor: "white"

            }}>

            <TextInput
                defaultValue={saplingid}
                style={{
                    ...commonStyles.txtInput,
                    ...treeFormModalStyles.saplingIdInput(lightTheme, saplingid), fontStyle: "italic", height: 54, borderRadius: 10
                }

                }
                placeholder={Strings.labels.SaplingId}
                placeholderTextColor={'black'}
                onChangeText={text => {
                    setExistsInLocalDB(false);
                    setExistsInLiveDB(false);
                    setSaplingId(text.trim());

                }}
                onBlur={checkIfExists}
            />

            {saplingid && existsInLocalDB ? (
                <Text style={{ ...commonStyles.text5, color: 'red', fontWeight: 'bold', padding: 5 }}>
                    {saplingid} {Strings.alertMessages.alreadyExists}
                </Text>
            ) : (
                saplingid && existsInLiveDB && (
                    <Text style={{ ...commonStyles.text5, color: 'red', fontWeight: 'bold', padding: 5 }}>
                        {saplingid} {Strings.alertMessages.alreadyExistsInDB}
                    </Text>
                )
            )
            }
            <CustomDropdown
                initItem={selectedTreeType}
                items={treeItems}
                label={Strings.labels.SelectTreeType}
                onSelectItem={setSelectedTreeType}
            />


            <View style={{ ...treeFormModalStyles.imageContainer, marginTop: 9 }}>
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
                                uri: `data:image/jpeg;base64,${images[images.length - 1].data}`,
                            }}
                            style={treeFormModalStyles.image}
                        />
                    )}

                    {showImage && (
                        <TouchableOpacity
                            style={treeFormModalStyles.deleteButton}
                            onPress={() =>
                                Utils.confirmAction(
                                    () => handleDeleteItem(images[images.length - 1].name),
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
                                onCancel()
                            }}
                        >
                            {Strings.buttonLabels.cancel}
                        </Button>

                    </View>
                    <View style={CustomButtonStyles.buttonContainer}>
                        <Button
                            onPress={onSave}
                            //mode="contained"
                            buttonColor='#1D4ED8'
                            labelStyle={CustomButtonStyles.buttonLabel}
                            style={CustomButtonStyles.button}
                        >
                            {Strings.buttonLabels.Submit}
                        </Button>
                    </View>
                </View>
            </View>
        </ScrollView>
    )
}