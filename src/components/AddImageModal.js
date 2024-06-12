import { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, Image, View, ToastAndroid, Modal, TouchableOpacity } from 'react-native';
import { Strings } from "../services/Strings";
import { Utils } from "../services/Utils";
import { CoordinateSetter } from "./CoordinateSetter";
import { CustomDropdown } from "./CustomDropdown";
import { CustomButtonStyles, commonStyles, customModalStyles,treeFormModalStyles } from "../services/Styles";
import Icon from 'react-native-vector-icons/Ionicons';
import GlobalContext from '../context/GlobalContext ';
import { treeFormModes } from './TreeForm';
import { Button } from 'react-native-paper';

export const AddImageModal = ({ modalVisible, setModalVisible }) => {

    //const { inSaplingId, inLng, inLat, inImages, inTreeType, inPlot, inUserId } = treeData;
    // console.log("mode is: ", mode, inLat, inLng);
    //console.log("inTreeTpe: ", inTreeType, "inPlot: ", inPlot);
    const [saplingid, setSaplingId] = useState(null);
    const [lat, setlat] = useState(null);
    const [lng, setlng] = useState(null);
    // array of images
    const [images, setImages] = useState(null);
    const [showImage, setShowImage] = useState(false);

    const [treeItems, setTreeItems] = useState([]);
    const [selectedTreeType, setSelectedTreeType] = useState(null);
    const [selectedPlot, setSelectedPlot] = useState(null);
    const [userId, setUserId] = useState(null);

    const { lightTheme } = useContext(GlobalContext);
    console.log("--------------in addImageModal------------")


    // useEffect(() => {
    //     if (mode === treeFormModes.localEdit) {
    //         if (treeData.inImages.length > 0) {
    //             setShowImage(true);
    //         }
    //     }

    //     setSelectedPlot(inPlot);
    // }, [treeData])


    // const loadDataCallback = useCallback(async () => {

    //     try {
    //         if (mode === treeFormModes.addTree) {
    //             let userId = await Utils.getUserId();
    //             setUserId(userId);
    //         }
    //         let { treeTypes } = await Utils.getLocalTreeTypesAndPlots();
    //         setTreeItems(treeTypes);
    //     } catch (error) {
    //         console.error(error);
    //         const stackTrace = error.stack;
    //         const errorLog = {
    //             msg: 'happened while trying to fetch tree details from local db(loadDataCallback())',
    //             error: JSON.stringify(error),
    //             stackTrace: stackTrace,
    //         };
    //         //console.log("error phone: ", errorLog);
    //         await Utils.logException(JSON.stringify(errorLog));
    //     }
    // }, []);

    // useEffect(() => {
    //     loadDataCallback();
    // }, []);


    const handleDeleteItem = async (name) => {
        console.log("successfully deleted the image");
        setShowImage(false);
        const newImages = images.filter((item) => item.name !== name);
        setImages(newImages);
    };



    const handleAddImage = async (image) => {
        //console.log("handling setting image----");
        setImages([image]);
    }

    const pickImage = async (selectionId) => {

        let newImage = await Utils.getImage(true, selectionId);
        if (newImage === undefined) return;
        newImage = await Utils.formatImageForSapling(newImage, saplingid);
        await handleAddImage(newImage);
        setShowImage(true);
    };


    const onSave = async () => {
        //console.log("Sapling id value : ", saplingid)
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
                let existsInLiveDB = await Utils.checkIfSaplingExistsInLiveDB(
                    saplingid,
                );
                console.log(
                    '---------------does sapling exist in live---------',
                    existsInLiveDB,
                );
                if (existsInLiveDB) {
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
        if (saplingid === null || selectedTreeType === null || selectedPlot === null || (selectedTreeType && Object.keys(selectedTreeType).length === 0) || (selectedPlot && Object.keys(selectedPlot).length === 0)) {
            console.log("sd---", saplingid, selectedTreeType, selectedPlot);
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
            <ScrollView keyboardShouldPersistTaps="handled" style={{...commonStyles.borderedDisplay,...customModalStyles.centeredView}}>
            <View style={{...customModalStyles.modalView,marginTop:4}}>

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
            


                <View style={{...treeFormModalStyles.imageContainer,marginLeft:4,marginTop:4}}>
                    <TouchableOpacity
                        style={{...treeFormModalStyles.imagePicker}}
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