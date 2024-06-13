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

export const AddImageModal = ({ modalVisible, setModalVisible, finalShiftData, onFetchData}) => {

    //const { inSaplingId, inLng, inLat, inImages, inTreeType, inPlot, inUserId } = treeData;
    // console.log("mode is: ", mode, inLat, inLng);
    //console.log("inTreeTpe: ", inTreeType, "inPlot: ", inPlot);
    const { setPlaySound, setShiftDone, setTreesPlanted, treesPlanted, plotSelected, shiftType, shiftID, } = useContext(GlobalContext)
    const [saplingid, setSaplingId] = useState(null);
    const [lat, setlat] = useState(null);
    const [lng, setlng] = useState(null);
    // array of images
    const [image, setImage] = useState(null);
    const [showImage, setShowImage] = useState(false);

    const [treeItems, setTreeItems] = useState([]);
    //const [selectedPlot, setSelectedPlot] = useState(null);
    const [userId, setUserId] = useState(null);

    const { lightTheme } = useContext(GlobalContext);
    //console.log("--------------in addImageModal------------")


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
        //const newImages = images.filter((item) => item.name !== name);
        setImage(null);
    };



    // const handleAddImage = async (image) => {
    //     //console.log("handling setting image----");
    //     setImage(image);
    // }

    const pickImage = async (selectionId) => {
        Utils.startTask();
        let newImage = await Utils.getImage(true, selectionId);
        if (newImage === undefined) return;
        newImage = await Utils.formatImageForSapling(newImage, saplingid);
        console.log("-------------newImage-----------",newImage.name,newImage.meta.capturetimestamp)
        setImage(newImage);
        setShowImage(true);
        Utils.stopTask();
    };


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

    const onSave = async () => {
        //console.log("------------------sapling_id---",saplingid,"-----plot-----",plotSelected,"----Object.keys(plotSelected).length--",Object.keys(plotSelected).length)
        //console.log("Sapling id value : ", saplingid)
        let treesImages = await Utils.fetchTreesWithNewImage()
        //console.log("-----------------treesImages--------------",treesImages)
        let existsLocally = await Utils.checkIfImageAddedAlready(saplingid);

        if (existsLocally) {
            Alert.alert(
                Strings.alertMessages.invalidSaplingId,
                ' ' + Strings.alertMessages.imageAddedAlready + ' ' + Strings.labels.SaplingId + ' ' +
                saplingid
            );
            return;
        } else {
            let existsInLiveDB = await Utils.checkIfSaplingExistsInLiveDB(
                saplingid,
            );
            console.log(
                '---------------does sapling exist in live---------',
                existsInLiveDB,
            );
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
            //console.log("sd---", saplingid, selectedTreeType, plotSelected);
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

                const result = await Utils.fetchTreesWithNewImage();
                //console.log("----------------just saved------------", result)

            } catch (error) {
                console.error(error);
                const stackTrace = error.stack;
                const errorLog = {
                    msg: "happened while trying to save image fro tree in AddImageModal",
                    error: JSON.stringify(error),
                    stackTrace: stackTrace
                }
                //console.log("error phone: ", errorLog);
                await Utils.logException(JSON.stringify(errorLog));
            }
        };
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={
                modalVisible //changesNeeded
            }
        //onRequestClose={handleDetailsChanges}
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
                            setSaplingId(text);
                        }}
                    />



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
        </Modal>
    )
}