import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Strings } from '../services/Strings';
import { Utils } from '../services/Utils';
import LoadingScreen from '../screens/LoadingScreen';
import { Alert, ScrollView, Text, TextInput, Image, View, ToastAndroid, Modal, TouchableOpacity, BackHandler } from 'react-native';
import { CoordinateSetter } from "../components/CoordinateSetter";
import { CustomButtonStyles, commonStyles, customModalStyles, treeFormModalStyles, treeFormStyles } from "../services/Styles";
import Icon from 'react-native-vector-icons/Ionicons';
import { Button } from 'react-native-paper';
import GlobalContext from '../context/GlobalContext ';

function EditLocalAddImage({ navigation, route }) {

    const { sapling_id, shiftID, plotSelected } = route.params;
    const { lightTheme } = useContext(GlobalContext);
    const [saplingid, setSaplingId] = useState(null);
    const [lat, setlat] = useState(null);
    const [lng, setlng] = useState(null);
    // array of images
    const [image, setImage] = useState(null);
    const [showImage, setShowImage] = useState(false);
    const [isFetchingDetails, setIsFetchingDetails] = useState(true);

    const [userId, setUserId] = useState(null);

    const [existsInLocalDB, setExistsInLocalDB] = useState(false);
    const [existsInLiveDB, setExistsInLiveDB] = useState(true);
    const [inActive, setInActive] = useState(0);
    const [galleryModalVisible, setGalleryModalVisible] = useState(false);
    const [clickedNewImage, setClickedNewImage] = useState(false);

    useEffect(() => {
        Utils.addTasks();
    }, []);

    useEffect(() => {

        console.log("inside local tree edit");
        const backAction = () => {
            navigation.goBack()
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, [])

    const fetchDetails = useCallback(async (saplingid) => {

        try {
            if (saplingid === null || saplingid === undefined) {
                ToastAndroid.show(`${Strings.alertMessages.UnableToFetch} ${saplingid} `, ToastAndroid.LONG);
                navigation.go
                return
            }

            const treeDetails = await Utils.fetchLocalTreeImage(saplingid);
            if (!treeDetails) {
                navigation.goBack()
                ToastAndroid.show(`${Strings.alertMessages.UnableToFetch} ${saplingid} `, ToastAndroid.LONG);
                return;
            }
            console.log("treeDetails for add tree image---", saplingid, treeDetails.lat, treeDetails.lng);

            const inImage = {
                data: treeDetails.image,
                name: treeDetails.imageid,
                meta: { remark: treeDetails.remark },
                timestamp: treeDetails.timestamp
            }

            //console.log("inImage---" , inImage);

            setImage(inImage);
            setShowImage(true);
            setlat(JSON.parse(treeDetails.lat));
            setlng(JSON.parse(treeDetails.lng));
            setUserId(treeDetails.user_id);
            setInActive(treeDetails.inActive);
            setIsFetchingDetails(false);

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
        setSaplingId(sapling_id);
        fetchDetails(sapling_id);
    }, [sapling_id]);


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
        setClickedNewImage(true);
        setShowImage(true);
        Utils.stopTask();
    };



    const checkIfExists = async () => {
        //console.log("compare", sapling_id, saplingid);
        if (saplingid == null || sapling_id === saplingid) {
            return
        }

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

        if (sapling_id !== saplingid) {

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
        }

        if (saplingid === null) {
            Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.IncompleteFields);
            return;
        }
        else if (image === null) {
            Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.NoImage);
            return;
        }

        else {
            try {

                if (sapling_id !== saplingid) {
                    //new sapling id 
                    if (!clickedNewImage) {
                        const timestamp = image.timestamp;
                        const imageName = `${saplingid}_${timestamp}.jpg`;
                        image.name = imageName
                    }
                    await Utils.deleteAddTreeImagesBySaplingId(sapling_id);
                    await Utils.updateSaplingInShiftDB(saplingid, sapling_id, shiftID);
                }

                const tree = {
                    sapling_id: saplingid,
                    lat: lat,
                    lng: lng,
                    user_id: userId,
                    image: image,
                    inActive: inActive,
                    timestamp: new Date().toISOString()
                };

                //console.log("--------------new image for tree---------", tree);

                await Utils.saveNewImage(tree);

                let toastmsg = Strings.alertMessages.TreeUpdatedfirsthalf + saplingid + Strings.alertMessages.TreeUpdatedsecondhalf;
                ToastAndroid.show(toastmsg, ToastAndroid.LONG);

                setClickedNewImage(false);
                navigation.goBack();

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

    if (!isFetchingDetails) {

        return (
            <ScrollView keyboardShouldPersistTaps='handled' scrollEnabled={true} style={{ flex: 1, borderRadius: 10 }}>
                <View
                    keyboardShouldPersistTaps='handled'
                    scrollEnabled={true}
                    style={{ ...treeFormStyles.detailsContainerOuter, marginBottom: 10 }} >
                    <View style={{ margin: 4 }}>

                        <Text style={treeFormStyles.plotSapling}>
                            {plotSelected}
                        </Text>

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



                        <View style={treeFormStyles.imageContainer}>
                            <View style={{ width: '100%', height: 200 }}>
                                <TouchableOpacity
                                    style={{ ...treeFormModalStyles.imagePicker }}
                                    onPress={() => {
                                        setGalleryModalVisible(true);
                                    }}>

                                    {!showImage ? (
                                        <View style={{ ...treeFormModalStyles.cameraIcon, justifyContent: 'center', alignItems: 'center' }}>
                                            <Image
                                                source={require('../../assets/icon-bw-camera.png')}
                                            />
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
                                        <TouchableOpacity onPress={() => pickImage(0)} style={{ backgroundColor: "green", padding: 10, }}>
                                            <Text style={{ color: "white", fontWeight: 'bold', fontSize: 15 }}> {Strings.buttonLabels.openCamera}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => pickImage(1)} style={{ backgroundColor: "green", padding: 10, }}>
                                            <Text style={{ color: "white", fontWeight: 'bold', fontSize: 15 }}> {Strings.buttonLabels.openGallery}</Text>
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
                                            navigation.goBack()
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
                </View>
            </ScrollView>
        )
    } else {
        <LoadingScreen />
    }
}


export default EditLocalAddImage