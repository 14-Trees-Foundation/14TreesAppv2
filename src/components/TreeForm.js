import { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Button, ScrollView, Text, TextInput, Image, View, ToastAndroid, Modal, TouchableOpacity } from 'react-native';
import { Strings } from "../services/Strings";
import { Utils } from "../services/Utils";
import { CustomButton } from "./Components";
import { CoordinateSetter } from "./CoordinateSetter";
import { CustomDropdown } from "./CustomDropdown";
import { commonStyles } from "../services/Styles";
import Icon from 'react-native-vector-icons/Ionicons';
import GlobalContext from '../context/GlobalContext ';

export const treeFormModes = {
    addTree: 0,
    localEdit: 1,
    remoteEdit: 2,
    plotSelect: 3,
    startShift: 4,
    showSync: 5,
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

        if (mode === treeFormModes.localEdit) {
            if (treeData.inImages.length > 0) {
                setShowImage(true);
            }
        }

        if (mode === treeFormModes.remoteEdit) {
            console.log("-- now mode is remote edit---");
            console.log("treeData.image.length-- ", treeData.inImages.length);
            //setImages(treeData.inImages);

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
            console.log("----new set images-----", newImages, "-----onDeleteImage-----", onDeleteImage, "------exisitingImages-----", exisitingImages)
            await onDeleteImage(name);
        }
    };


    const handleAddImage = async (image) => {
        if (onNewImage) {
            await onNewImage(image);
        }
        setImages([image]);

        //setImages([...images, image]);
    }

    const pickImage = async (selectionId) => {
        setModalVisible(false)
        let newImage = await Utils.getImage(true, selectionId);
        if (newImage === undefined) return;
        newImage = await Utils.formatImageForSapling(newImage, saplingid);
        await handleAddImage(newImage);
        setShowImage(true);
    };


    const onSave = async () => {
        console.log("Sapling id value : ", saplingid)

        if (mode === treeFormModes.localEdit && inSaplingId !== saplingid) {
            console.log("-------------localEdit in TreeForm------------")
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

                //setSelectedPlot({}); //to default the plot
                setShowImage(false)
                setImages([]);
                setlat(0);
                setlng(0);
                await onVerifiedSave(tree, images);
                // setLocalDataChanged(true);
            } catch (error) {
                console.error(error);
                const stackTrace = error.stack;
                const errorLog = {
                    msg: "happened while trying to save tree details in onSave() of TreeForm",
                    error: JSON.stringify(error),
                    stackTrace: stackTrace
                }
                //console.log("error phone: ", errorLog);
                await Utils.logException(JSON.stringify(errorLog));
            }
        };
    }

    return (

        <ScrollView
            keyboardShouldPersistTaps='handled'
            scrollEnabled={true}
            style={{
                backgroundColor: 'white',
                padding: 2, margin: 4,
                borderRadius: 10, borderColor: '#ccc', borderWidth: 3,
            }} >
            <View style={{ margin: 4, borderRadius: 10 }}>



                {(mode === treeFormModes.localEdit && selectedPlot) && <Text style={{
                    ...commonStyles.text4, color: '#113160',
                    fontFamily: 'Inter-Regular', fontSize: 20, textAlign: 'center', marginTop: 25, fontWeight: '300'
                }}>
                    {selectedPlot.name}
                </Text>
                }

                {mode === treeFormModes.remoteEdit && <Text style={{
                    ...commonStyles.text4, color: '#113160',
                    fontFamily: 'Inter-Regular', fontSize: 20, textAlign: 'center', marginTop: 25, fontWeight: '300'
                }}>
                    {saplingid}
                </Text>
                }

                {mode === treeFormModes.localEdit && (
                    <View style={{ marginTop: 15 }}>
                        <TextInput
                            defaultValue={saplingid}
                            style={{
                                ...commonStyles.txtInput,
                                color: lightTheme ? '#52525C' : 'black',
                                fontSize: 15, borderRadius: 13,
                                fontWeight: saplingid ? '800' : 'normal'
                            }}
                            placeholder={Strings.labels.SaplingId}
                            placeholderTextColor={'black'}
                            onChangeText={(text) => { setSaplingId(text) }}
                        />


                    </View>
                )
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

                {/* add the click button functionality for edit tree screen */}
                <View style={{ flexDirection: "column", marginHorizontal: 20, marginTop: 20, marginBottom: 25, alignItems: 'center', justifyContent: 'space-around' }}>
                    {/* First View */}
                    <View style={{ width: '100%', height: 200 }}>
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                backgroundColor: (mode === treeFormModes.remoteEdit && disableButton) ? "#969393" : "#969393",
                                padding: 0,
                                borderColor: "#059636",
                                borderRadius: 10,
                                alignItems: "center",
                                borderWidth: 1,
                                marginTop: 0,
                                marginHorizontal: 0,
                                margin: 0,
                                position: 'relative'
                            }}
                            onPress={() => {
                                if (mode === treeFormModes.remoteEdit && disableButton) {
                                    ToastAndroid.show(Strings.alertMessages.deleteImageEdit, ToastAndroid.SHORT);
                                } else {
                                    setModalVisible(true);
                                }
                            }}
                        >

                            {!showImage ? <Image
                                source={require('../../assets/camera.png')}
                                style={{
                                    width: '100%',
                                    height: 197,
                                    margin: 0,
                                    borderRadius: 10,
                                    //aspectRatio: 720 / 960, // Aspect ratio of your image (maxWidth / maxHeight)
                                    //resizeMode: 'contain', // Preserve aspect ratio and fit within the specified dimensions 
                                }}
                            /> : <Image
                                source={{ uri: `data:image/jpeg;base64,${images[images.length - 1].data}` }}
                                style={{
                                    width: '100%',
                                    height: 197,
                                    margin: 1,
                                    //borderRadius: 10,
                                    aspectRatio: 1220 / 920, // Aspect ratio of your image (maxWidth / maxHeight)
                                    //resizeMode: 'contain', // Preserve aspect ratio and fit within the specified dimensions 
                                }}
                            />
                            }

                            {showImage && <TouchableOpacity style={{ position: 'absolute', top: 8, right: 8 }} onPress={() => Utils.confirmAction(() => handleDeleteItem(images[images.length - 1].name), Strings.alertMessages.confirmDeleteImage)}>
                                <Image
                                    source={require('../../assets/icondelete.png')} // Replace with your delete icon image
                                    style={{ width: 25, height: 25, marginLeft: 10 }} // Adjust the icon dimensions and margin
                                />
                            </TouchableOpacity>}
                        </TouchableOpacity>


                    </View>

                    {/* Second View */}
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
                    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <View style={{ backgroundColor: 'white', padding: 40 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 10 }}>

                                <TouchableOpacity onPress={() => pickImage(0)} style={{ backgroundColor: "green", padding: 10, }}>
                                    <Text style={{ color: "white", fontWeight: 'bold', fontSize: 15 }}> {Strings.buttonLabels.openCamera}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => pickImage(1)} style={{ backgroundColor: "green", padding: 10, }}>
                                    <Text style={{ color: "white", fontWeight: 'bold', fontSize: 15 }}> {Strings.buttonLabels.openGallery}</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }} onPress={() => setModalVisible(false)}  >
                                <Icon name="close-circle" size={28} color="red" />
                            </TouchableOpacity>
                        </View>

                    </View>
                </Modal>

                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 30, marginTop: 0, marginBottom: 2 }}>
                    {
                        (onCancel !== undefined)
                        &&
                        <CustomButton text={Strings.buttonLabels.cancel} onPress={onCancel} opacityStyle={{ backgroundColor: 'red' }} />
                    }
                    <CustomButton
                        text={Strings.buttonLabels.Submit}
                        onPress={onSave}
                    />
                </View>
            </View>
        </ScrollView>
    )
}