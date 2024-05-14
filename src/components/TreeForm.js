import { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Button, FlatList, ScrollView, Text, TextInput, Image, View, ToastAndroid, Modal, TouchableOpacity } from 'react-native';
import { Strings } from "../services/Strings";
import { Utils } from "../services/Utils";
import { CustomButton, ImageWithEditableRemark, ImageWithUneditableRemark } from "./Components";
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

    const { inSaplingId, inLng, inLat, inImages, inTreeType, inPlot, inUserId, inShiftId, inSequenceNo } = treeData;
    
    //console.log("inTreeTpe: ", inTreeType, "inPlot: ", inPlot);
    const [saplingid, setSaplingId] = useState(inSaplingId);
    // console.log('saplingid: ',inSaplingId);
    const [lat, setlat] = useState(inLat);
    const [lng, setlng] = useState(inLng);
    // array of images
    const [images, setImages] = useState(inImages);
    //const [exisitingImages, setExistingImages] = useState(inImages)
    const [showImage, setShowImage] = useState(false);

    const [localSaplingIds, setLocalSaplingIds] = useState([])
    const [liveSaplingIds, setLiveSaplingIds] = useState([])
    const [treeItems, setTreeItems] = useState([]);
    const [plotItems, setPlotItems] = useState([]);
    //const [mainScrollEnabled, setMainScrollEnabled] = useState(true);
    const [selectedTreeType, setSelectedTreeType] = useState(inTreeType);
    const [selectedPlot, setSelectedPlot] = useState(inPlot);
    const [userId, setUserId] = useState(inUserId);
    const [modalVisible, setModalVisible] = useState(false);
    const [disableButton, setDisableButton] = useState(true);
    const [changeCordinate, setChangeCordinate] = useState(false);

    const { lightTheme } = useContext(GlobalContext);

    // console.log("shiftID treeform inshift---", inShiftId)

    useEffect(() => {
       // console.log("shiftID treeform inshift---", inShiftId)
        //console.log(treeData.inSaplingId)
        if (mode === treeFormModes.localEdit) {
            console.log("-- now mode is local edit---");
            setShowImage(true);
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

    //Namrata
    const loadDataCallback = useCallback(async () => {
        console.log('fetching data')
        try {
            if (mode === treeFormModes.addTree) {
                let userId = await Utils.getUserId();
                setUserId(userId);
            }
            let { treeTypes, plots } = await Utils.getLocalTreeTypesAndPlots();
            let saplingDocsInLiveDB = await Utils.fetchSaplingIdsFromLiveDB();
            let saplingsInLiveDB = saplingDocsInLiveDB.map((doc) => doc.sapling_id)
            //console.log("saplings in Live DB ",saplingsInLiveDB)
            setLiveSaplingIds(saplingsInLiveDB)
            setTreeItems(treeTypes);
            setPlotItems(plots);
            let saplingIds = await Utils.fetchSaplingIdsFromLocalDB();
            saplingIds = saplingIds.map((saplingid) => saplingid.name)
            saplingIds = saplingIds.filter((id) => (id !== inSaplingId));
            setLocalSaplingIds(saplingIds);

        } catch (error) {
            console.error(error);
            const stackTrace = error.stack;
            const errorLog = {
                msg: "happened while trying to fetch tree details from local db(loadDataCallback())",
                error: JSON.stringify(error),
                stackTrace: stackTrace
            }
            //console.log("error phone: ", errorLog);
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

    };


    const handleAddImage = async (image) => {
        //console.log("image: ", image);

        if (onNewImage) {
            await onNewImage(image);
        }
        //setImages([...images, image]);

        console.log("handling setting image----");
        //setExistingImages([]);
        setImages([image]);
    }

    const pickImage = async (selectionId) => {
        setModalVisible(false)
        let newImage = await Utils.getImage(true, selectionId);
        if (newImage == undefined) return;
        newImage = await Utils.formatImageForSapling(newImage, saplingid);
        await handleAddImage(newImage);
        setShowImage(true);
    };


    const onSave = async () => {
        console.log("Sapling id value : ", saplingid)

        if (localSaplingIds.includes(saplingid)) {
            Alert.alert(Strings.alertMessages.invalidSaplingId, Strings.labels.SaplingId + ' ' + saplingid + ' ' + Strings.alertMessages.alreadyExists);
            return;
        }
        else if (liveSaplingIds.includes(saplingid) && mode !== treeFormModes.remoteEdit) {
            Alert.alert(Strings.alertMessages.invalidSaplingId, Strings.labels.SaplingId + ' ' + saplingid + ' ' + Strings.alertMessages.alreadyExistsInDB);
            return;
        }
        else if (saplingid === null || selectedTreeType === null || selectedPlot === null || selectedTreeType && Object.keys(selectedTreeType).length === 0 || (selectedPlot && Object.keys(selectedPlot).length === 0)) {
            console.log(selectedTreeType, selectedPlot);
            Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.IncompleteFields);
            return;
        }
        else if (images.length === 0) { //existingImages.length
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
                    user_id: userId,
                    shiftID: inShiftId,
                    sequenceNo: inSequenceNo,
                    timestamp: new Date().toISOString()
                };
                console.log("final tree data----", tree);
                setSaplingId(null);
                setSelectedTreeType(null);
                setChangeCordinate(!changeCordinate)
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
        <View style={{
            backgroundColor: 'white',
            padding: 2, margin: 4,
            borderRadius: 10, borderColor: '#ccc', borderWidth: 3,
        }} >
            <View style={{ margin: 4, borderRadius: 10 }}>


                <View>
                    {selectedPlot && mode === treeFormModes.localEdit && <Text style={{
                        ...commonStyles.text4, color: '#113160',
                        fontFamily: 'Inter-Regular', fontSize: 20, textAlign: 'center', marginTop: 25, fontWeight: '300'
                    }}>
                        {selectedPlot.name}
                    </Text>}
                </View>

                {
                    mode === treeFormModes.remoteEdit && <Text style={{
                        ...commonStyles.text4, color: '#113160',
                        fontFamily: 'Inter-Regular', fontSize: 20, textAlign: 'center', marginTop: 25, fontWeight: '300'
                    }}>
                        {saplingid}
                    </Text>
                }

                {
                    mode !== treeFormModes.remoteEdit && (
                        <View style={{ marginTop: mode !== treeFormModes.addTree ? 1 : 15 }}>
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
                            {
                                liveSaplingIds.includes(saplingid) ? (
                                    <Text style={{ ...commonStyles.text5, color: 'red', fontWeight: '500', padding: 5 }}>
                                        {saplingid} {Strings.alertMessages.alreadyExistsInDB}
                                    </Text>
                                ) : (
                                    localSaplingIds.includes(saplingid) && (
                                        <Text style={{ ...commonStyles.text5, color: 'red', fontWeight: 'bold', padding: 5 }}>
                                            {saplingid} {Strings.alertMessages.alreadyExists}
                                        </Text>
                                    )
                                )
                            }

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
                                } else if (mode === treeFormModes.addTree) {
                                    pickImage(0) //open camera
                                } else {
                                    setModalVisible(true);
                                }
                            }}
                        >
                    
                            {!showImage  ? <Image
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
                            //setInitLocation={mode === treeFormModes.addTree}
                            inLat={inLat}
                            inLng={inLng}
                            onSetLat={(item) => setlat(item)}
                            onSetLng={(item) => setlng(item)}
                            changeCordinate={changeCordinate}
                            onChangeCordinate={() => setChangeCordinate(false)}
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
        </View>
    )
}