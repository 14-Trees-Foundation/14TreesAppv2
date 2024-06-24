import { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, Image, View, ToastAndroid, Modal, TouchableOpacity } from 'react-native';
import { Strings } from "../services/Strings";
import { Utils } from "../services/Utils";
import { CoordinateSetter } from "./CoordinateSetter";
import { CustomDropdown } from "./CustomDropdown";
import { CustomButtonStyles, commonStyles, treeFormModalStyles, treeFormStyles } from "../services/Styles";
import Icon from 'react-native-vector-icons/Ionicons';
import GlobalContext from '../context/GlobalContext ';
import { Button } from 'react-native-paper';

export const treeFormModes = {
    addTree: 0,
    localEdit: 1,
    remoteEdit: 2,
    plotChange: 3,
    startShift: 4,
}

export const TreeForm = ({ treeData, onVerifiedSave, mode, onCancel, onNewImage, onDeleteImage }) => {

    const { inSaplingId, inLng, inLat, inImages, inTreeType, inPlot, inUserId } = treeData;


    const [saplingid, setSaplingId] = useState(inSaplingId);
    const [lat, setlat] = useState(inLat);
    const [lng, setlng] = useState(inLng);

    // array of images
    const [images, setImages] = useState(inImages);
    const [showImage, setShowImage] = useState(false);

    const [treeItems, setTreeItems] = useState([]);
    const [plotItems, setPlotItems] = useState([]);

    const [selectedTreeType, setSelectedTreeType] = useState(inTreeType);
    const [selectedPlot, setSelectedPlot] = useState(inPlot);

    const [modalVisible, setModalVisible] = useState(false);
    const [disableButton, setDisableButton] = useState(true);

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

        if (mode === treeFormModes.remoteEdit) {
            if (treeData.inImages.length === 0) {
                setDisableButton(false);
            } else {
                setShowImage(true);
                setDisableButton(true);
            }
        }
    }, [treeData])

    const loadDataCallback = useCallback(async () => {
        console.log('fetching data');
        try {
            let { treeTypes, plots } = await Utils.getLocalTreeTypesAndPlots();
            setTreeItems(treeTypes);
            setPlotItems(plots);
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

        if (newImages.length === 0 && mode === treeFormModes.remoteEdit) {
            setDisableButton(false);
        }

        if (onDeleteImage) {
            await onDeleteImage(name);
        }
    };


    const handleAddImage = async (image) => {
        if (onNewImage) {
            await onNewImage(image);
        }
        setImages([image]);
    }

    const pickImage = async (selectionId) => {
        setModalVisible(false);
        Utils.startTask();
        let newImage = await Utils.getImage(true, selectionId);
        if (newImage === undefined) return;
        newImage = await Utils.formatImageForSapling(newImage, saplingid);
        await handleAddImage(newImage);
        setShowImage(true);
        Utils.stopTask();
    };


    const onSave = async () => {

        if (mode === treeFormModes.localEdit && inSaplingId !== saplingid) {
            let existsLocally = await Utils.checkIfSaplingExistsLocally(saplingid);

            if (existsLocally) {
                Alert.alert(Strings.alertMessages.invalidSaplingId, Strings.labels.SaplingId +
                    ' ' + saplingid + ' ' + Strings.alertMessages.alreadyExists,);
                return;
            }
            else {
                let existsInLiveDB = await Utils.checkIfSaplingExistsInLiveDB(saplingid);
                if (existsInLiveDB) {
                    Alert.alert(Strings.alertMessages.invalidSaplingId,
                        Strings.labels.SaplingId + ' ' + saplingid + ' ' + Strings.alertMessages.alreadyExistsInDB,
                    );
                    return;
                }
            }
        }
        if (saplingid === null || selectedTreeType === null || selectedPlot === null || selectedTreeType && Object.keys(selectedTreeType).length === 0 || (selectedPlot && Object.keys(selectedPlot).length === 0)) {
            console.log(selectedTreeType, selectedPlot);
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
        else {
            try {
                const tree = {
                    treeid: selectedTreeType.value,
                    saplingid: saplingid,
                    lat: lat,
                    lng: lng,
                    plotid: selectedPlot.value,
                    user_id: inUserId,
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
        };
    }

    return (

        <ScrollView
            keyboardShouldPersistTaps='handled'
            scrollEnabled={true}
            style={{ ...treeFormStyles.detailsContainerOuter, marginBottom: 10, marginHorizontal: 0 }} >
            <View style={{ margin: 4, borderRadius: 10 }}>


                {(mode === treeFormModes.localEdit && selectedPlot) &&
                    <Text style={treeFormStyles.plotSapling}>
                        {selectedPlot.name}
                    </Text>
                }

                {mode === treeFormModes.remoteEdit && <Text style={treeFormStyles.plotSapling}>
                    {saplingid}
                </Text>
                }

                {mode === treeFormModes.localEdit && (
                    <View style={{ marginTop: 15 }}>
                        <TextInput
                            defaultValue={saplingid}
                            style={treeFormStyles.textInput(lightTheme, saplingid)}
                            placeholder={Strings.labels.SaplingId}
                            placeholderTextColor={'black'}
                            onChangeText={(text) => { setSaplingId(text) }}
                        />


                    </View>)
                }

                <CustomDropdown
                    initItem={selectedTreeType}
                    items={treeItems}
                    label={Strings.labels.SelectTreeType}
                    onSelectItem={setSelectedTreeType}
                />
                {mode === treeFormModes.remoteEdit && <CustomDropdown
                    initItem={selectedPlot}
                    items={plotItems}
                    label={Strings.labels.SelectPlot}
                    onSelectItem={setSelectedPlot}

                />}

                <View style={treeFormStyles.imageContainer}>

                    <View style={{ width: '100%', height: 200 }}>
                        <TouchableOpacity
                            style={{
                                ...treeFormStyles.imagePicker, backgroundColor:
                                    mode === treeFormModes.remoteEdit && disableButton ? '#969393' : '#969393',
                            }}
                            onPress={() => {
                                if (mode === treeFormModes.remoteEdit && disableButton) {
                                    ToastAndroid.show(Strings.alertMessages.deleteImageEdit, ToastAndroid.SHORT);
                                } else {
                                    setModalVisible(true);
                                }
                            }}
                        >

                            {!showImage ? <View style={{ ...treeFormModalStyles.cameraIcon, justifyContent: 'center', alignItems: 'center' }}>
                                <Image
                                    source={require('../../assets/icon-bw-camera.png')}
                                />
                            </View>
                                : <Image
                                    source={{ uri: `data:image/jpeg;base64,${images[images.length - 1].data}` }}
                                    style={treeFormStyles.imageExists}
                                />
                            }

                            {showImage && <TouchableOpacity style={treeFormStyles.imageDelete} onPress={() => Utils.confirmAction(() => handleDeleteItem(images[images.length - 1].name), Strings.alertMessages.confirmDeleteImage)}>
                                <Image
                                    source={require('../../assets/icondelete.png')} // Replace with your delete icon image
                                    style={treeFormStyles.deleteIcon} // Adjust the icon dimensions and margin
                                />
                            </TouchableOpacity>}
                        </TouchableOpacity>


                    </View>


                    <View style={{ width: '100%', marginTop: 0 }}>
                        <CoordinateSetter
                            inLat={lat}
                            inLng={lng}
                            onSetLat={(item) => setlat(item)}
                            onSetLng={(item) => setlng(item)}
                        />
                    </View>
                </View>

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(false);
                    }}
                >
                    <View style={treeFormStyles.modalContainer}>
                        <View style={{ backgroundColor: 'white', padding: 40 }}>
                            <View style={treeFormStyles.buttonContainer}>

                                <TouchableOpacity onPress={() => pickImage(0)} style={treeFormStyles.modalButtons}>
                                    <Text style={treeFormStyles.buttonText}> {Strings.buttonLabels.openCamera}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => pickImage(1)} style={treeFormStyles.modalButtons}>
                                    <Text style={treeFormStyles.buttonText}> {Strings.buttonLabels.openGallery}</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={treeFormStyles.cancelModal} onPress={() => setModalVisible(false)}  >
                                <Icon name="close-circle" size={28} color="red" />
                            </TouchableOpacity>
                        </View>

                    </View>
                </Modal>

                <View style={CustomButtonStyles.container}>
                    <View style={CustomButtonStyles.buttonRow}>
                        <View style={CustomButtonStyles.buttonContainer}>
                            {
                                (onCancel !== undefined)
                                &&
                                <Button
                                    mode="contained"
                                    buttonColor='red'
                                    labelStyle={CustomButtonStyles.buttonLabel}
                                    style={CustomButtonStyles.button}
                                    onPress={onCancel}
                                >
                                    {Strings.buttonLabels.cancel}
                                </Button>
                            }
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
    )
}

