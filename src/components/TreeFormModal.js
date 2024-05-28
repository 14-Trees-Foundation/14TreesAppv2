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
import { treeFormModes } from './TreeForm';

export const TreeFormModal = ({ treeData, onVerifiedSave, mode, onCancel }) => {

    const { inSaplingId, inLng, inLat, inImages, inTreeType, inPlot, inUserId } = treeData;
    // console.log("mode is: ", mode, inLat, inLng);
    //console.log("inTreeTpe: ", inTreeType, "inPlot: ", inPlot);
    const [saplingid, setSaplingId] = useState(inSaplingId);
    const [lat, setlat] = useState(inLat);
    const [lng, setlng] = useState(inLng);
    // array of images
    const [images, setImages] = useState(inImages);
    const [showImage, setShowImage] = useState(false);

    const [localSaplingIds, setLocalSaplingIds] = useState([]);
    const [liveSaplingIds, setLiveSaplingIds] = useState([]);
    const [treeItems, setTreeItems] = useState([]);
    const [selectedTreeType, setSelectedTreeType] = useState(inTreeType);
    const [selectedPlot, setSelectedPlot] = useState(null);
    const [userId, setUserId] = useState(inUserId);

    const { lightTheme } = useContext(GlobalContext);



    useEffect(() => {
        if (mode === treeFormModes.localEdit) {
            if (treeData.inImages.length > 0) {
                setShowImage(true);
            }
        }

        if (mode === treeFormModes.addTree) {
            setSelectedPlot(inPlot);
        }

    }, [treeData])


    const loadDataCallback = async () => {
        console.log('fetching data from local db')
        try {
            if (mode === treeFormModes.addTree) {
                let userId = await Utils.getUserId();
                setUserId(userId);
            }
            let { treeTypes } = await Utils.getLocalTreeTypesAndPlots();
            let saplingDocsInLiveDB = await Utils.fetchSaplingIdsFromLiveDB();
            let saplingsInLiveDB = saplingDocsInLiveDB.map((doc) => doc.sapling_id)
            //console.log("saplings in Live DB ",saplingsInLiveDB)
            setLiveSaplingIds(saplingsInLiveDB)
            setTreeItems(treeTypes);
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
    }

    useEffect(() => {
        loadDataCallback();
    }, []);


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
        if (newImage == undefined) return;
        newImage = await Utils.formatImageForSapling(newImage, saplingid);
        await handleAddImage(newImage);
        setShowImage(true);
    };


    const onSave = async () => {
        //console.log("Sapling id value : ", saplingid)

        if (localSaplingIds.includes(saplingid)) {
            Alert.alert(Strings.alertMessages.invalidSaplingId, Strings.labels.SaplingId + ' ' + saplingid + ' ' + Strings.alertMessages.alreadyExists);
            return;
        }
        else if (liveSaplingIds.includes(saplingid)) {
            Alert.alert(Strings.alertMessages.invalidSaplingId, Strings.labels.SaplingId + ' ' + saplingid + ' ' + Strings.alertMessages.alreadyExistsInDB);
            return;
        }
        else if (saplingid === null || selectedTreeType === null || selectedPlot === null || (selectedTreeType && Object.keys(selectedTreeType).length === 0) || (selectedPlot && Object.keys(selectedPlot).length === 0)) {
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
                setLocalSaplingIds([...localSaplingIds, saplingid]);

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
            padding: 2,
            margin: 10,
            borderRadius: 10, borderColor: '#ccc', borderWidth: 3,
            width: '98%'
        }} >

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

            <CustomDropdown
                initItem={selectedTreeType}
                items={treeItems}
                label={Strings.labels.SelectTreeType}
                onSelectItem={setSelectedTreeType}
            />


            {/* First View */}
            <View style={{ width: '90%', height: 200, marginHorizontal: 2, marginLeft: 15 }}>
                <TouchableOpacity
                    style={{
                        //flex: 1,
                        backgroundColor: "#969393",
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
                        pickImage(0);
                    }}
                >
                    {!showImage ? <Image
                        source={require('../../assets/camera.png')}
                        style={{
                            width: '100%',
                            height: 200,
                            margin: 0,
                            borderRadius: 10,
                            //aspectRatio: 720 / 960, // Aspect ratio of your image (maxWidth / maxHeight)
                            //resizeMode: 'contain', // Preserve aspect ratio and fit within the specified dimensions 
                        }}
                    /> : <Image
                        source={{ uri: `data:image/jpeg;base64,${images[images.length - 1].data}` }}
                        style={{
                            width: '100%',
                            height: 200,
                            margin: 1,
                            //borderRadius: 10,
                            aspectRatio: 1220 / 920, // Aspect ratio of your image (maxWidth / maxHeight)
                            //resizeMode: 'contain', // Preserve aspect ratio and fit within the specified dimensions 
                        }}
                    />
                    }

                    {showImage && <TouchableOpacity style={{ position: 'absolute', top: 8, right: 5 }} onPress={() => Utils.confirmAction(() => handleDeleteItem(images[images.length - 1].name), Strings.alertMessages.confirmDeleteImage)}>
                        <Image
                            source={require('../../assets/icondelete.png')} // Replace with your delete icon image
                            style={{ width: 25, height: 25, marginLeft: 10 }} // Adjust the icon dimensions and margin
                        />
                    </TouchableOpacity>
                    }
                </TouchableOpacity>


            </View>

            {/* Second View */}
            <CoordinateSetter
                inLat={lat}
                inLng={lng}
                onSetLat={(item) => setlat(item)}
                onSetLng={(item) => setlng(item)}
            />



            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 30, marginTop: 15, marginBottom: 5 }}>

                <CustomButton
                    text={Strings.buttonLabels.cancel}
                    onPress={() => {
                        onCancel()
                    }}
                    opacityStyle={{ backgroundColor: 'red' }} />

                <CustomButton
                    text={Strings.buttonLabels.Submit}
                    onPress={onSave}
                />
            </View>
        </View>
    )
}