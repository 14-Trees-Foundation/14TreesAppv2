import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, FlatList, ScrollView, Text, TextInput, View, ToastAndroid } from 'react-native';
import { Strings } from "../services/Strings";
import { Utils } from "../services/Utils";
import { CustomButton, ImageWithEditableRemark, ImageWithUneditableRemark } from "./Components";
import { CoordinateSetter } from "./CoordinateSetter";
import { CustomDropdown } from "./CustomDropdown";
import { commonStyles } from "../services/Styles";
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

export const treeFormModes = {
    addTree: 0,
    localEdit: 1,
    remoteEdit: 2
}

export const TreeForm = ({ treeData, onVerifiedSave, mode, onCancel, onNewImage, onDeleteImage }) => {
    const { inSaplingId, inLng, inLat, inImages, inTreeType, inPlot, inUserId } = treeData;
    console.log("mode is: ", mode);
    const [saplingid, setSaplingId] = useState(inSaplingId);
    // console.log('saplingid: ',inSaplingId);
    const [lat, setlat] = useState(inLat);
    const [lng, setlng] = useState(inLng);
    // array of images
    const [exisitingImages, setExistingImages] = useState(inImages)
    const [localSaplingIds, setLocalSaplingIds] = useState([])
    // const [imageForModal, setImageForModal] = useState([]); //imageForModal
    const [localDataChanged, setLocalDataChanged] = useState(false);
    const [liveSaplingIds, setLiveSaplingIds] = useState([])
    const [images, setImages] = useState([]);
    const [treeItems, setTreeItems] = useState([]);
    const [plotItems, setPlotItems] = useState([]);
    const [mainScrollEnabled, setMainScrollEnabled] = useState(true);
    const [selectedTreeType, setSelectedTreeType] = useState(inTreeType);
    const [selectedPlot, setSelectedPlot] = useState(inPlot);
    const [userId, setUserId] = useState(inUserId);
    const [disableButton, setDisableButton] = useState(true);

    useEffect(() => {
        console.log(treeData.inSaplingId)
        if (mode === treeFormModes.localEdit) {
            console.log("-- now mode is local edit---");
            setExistingImages([]);
            setImages(treeData.inImages);
        }

        if (mode === treeFormModes.remoteEdit) {
            console.log("-- now mode is remote edit---");
            console.log("treeData.image.length-- ", treeData.inImages.length);
            if (treeData.inImages.length === 0) {
                setDisableButton(false);
            } else {
                setDisableButton(true);
            }
        }
    }, [treeData])

    const handleDeleteExistingItem = async (name, time) => {
        console.log("deleteing images from edit---------");
        const newSetImages = exisitingImages.filter((item) => item.name !== name);
        if (newSetImages) {
            console.log("image found delete--------", newSetImages.length, "time: ", time);
        } else {
            console.log("image not found delete---------", newSetImages.length, "time: ", time);
        }

        if (newSetImages.length === 0 && mode === treeFormModes.remoteEdit) {
            setDisableButton(false);
        }

        if (onDeleteImage) {
            await onDeleteImage(name);
        }
        setExistingImages(newSetImages);


    }

    const handleDeleteItem = async (name) => {
        const newImages = images.filter((item) => item.name !== name);
        setImages(newImages);
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
        else if (saplingid === null || Object.keys(selectedTreeType).length === 0 || Object.keys(selectedPlot).length === 0) {
            Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.IncompleteFields);
            return;
        }
        else if (images.length + exisitingImages.length === 0) {
            Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.NoImage);
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
                };
                console.log(tree);
                setSaplingId(null);
                setSelectedTreeType({});
                setSelectedPlot({});
                setImages([]);
                await onVerifiedSave(tree, images);
                setLocalDataChanged(true);
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

    const handleAddImage = async (image) => {
        //console.log("image: ", image);

        if (onNewImage) {
            await onNewImage(image);
        }
        //setImages([...images, image]);

        console.log("handling setting image----");
        setExistingImages([]);
        setImages([image]);
    }

    const pickImage = async () => {
        let newImageResponse = await Utils.getImageFromCamera(true);
        if (newImageResponse == undefined) return;
        //console.log("new image response: ", newImageResponse);
        let newImage = newImageResponse.newImage;
        newImage = await Utils.formatImageForSapling(newImage, saplingid);
        await handleAddImage(newImage);

        // let imageForModal = newImageResponse.imageForModal;
        // //console.log("this image:", imageForModal);
        // setImageForModal(imageForModal);
    };

    const changeImageRemarkTo = (text, name) => {
        const newImages = images.map((image) => {
            if (image.name === name) {
                return {
                    ...image,
                    meta: {
                        ...image.meta,
                        remark: text,
                    },
                };
            }
            return image;
        });
        setImages(newImages);
    }

    const renderImage = ({ item, index }) => {
        const displayString = Utils.getDisplayString(index,
            item.meta.capturetimestamp,
            exisitingImages.length + images.length);


        if (index < exisitingImages.length) {
            //existing image, remark uneditable.
            return <ImageWithUneditableRemark
                item={item}
                displayString={displayString}
                key={index}
                onDelete={(item) => {
                    handleDeleteExistingItem(item.name, item.meta.capturetimestamp,);
                }} />;

        }
        //otherwise, remark is editable.
        return <ImageWithEditableRemark
            key={index}
            item={item}
            displayString={displayString}
            onDelete={(item) => {
                handleDeleteItem(item.name)
            }}
            onChangeRemark={(text) => {
                changeImageRemarkTo(text, item.name);
            }}
        />;
    }

    //Namrata
    const localDataFetch = useCallback(async () => {
        let saplingIds = await Utils.fetchSaplingIdsFromLocalDB();
        saplingIds = saplingIds.map((saplingid) => saplingid.name)
        saplingIds = saplingIds.filter((id) => (id !== inSaplingId));
        setLocalSaplingIds(saplingIds);
    })

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

    useEffect(() => {
        localDataFetch();
    }, [localDataChanged]);

    return (
        <ScrollView style={{ backgroundColor: '#5DB075', height: '100%' }} scrollEnabled={mainScrollEnabled}>
            <View style={{ backgroundColor: 'white', margin: 10, borderRadius: 10 }}>
                {
                    [
                        <View>
                            <TextInput
                                defaultValue={saplingid}
                                style={commonStyles.txtInput}
                                placeholder={Strings.labels.SaplingId}
                                placeholderTextColor={'#000000'}
                                onChangeText={(text) => { setSaplingId(text) }}
                            // value={saplingid}
                            />
                            {
                                liveSaplingIds.includes(saplingid) ? (
                                    <Text style={{ ...commonStyles.text5, color: 'red', fontWeight: 'bold', padding: 5 }}>
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
                        ,

                        <Text style={{ ...commonStyles.text4, textAlign: 'center' }}>
                            Sapling ID: {saplingid}
                        </Text>
                    ][mode]
                }
                <CustomDropdown
                    initItem={selectedTreeType}
                    items={treeItems}
                    label={Strings.labels.SelectTreeType}
                    onSelectItem={setSelectedTreeType}
                />
                <CustomDropdown
                    initItem={selectedPlot}
                    items={plotItems}
                    label={Strings.labels.SelectPlot}
                    onSelectItem={setSelectedPlot}
                />
                <CoordinateSetter
                    setInitLocation={mode === treeFormModes.addTree}
                    inLat={inLat}
                    inLng={inLng}
                    onSetLat={setlat}
                    onSetLng={setlng}
                    setOuterScrollEnabled={setMainScrollEnabled}
                    plotId={selectedPlot ? selectedPlot.value : undefined}
                ></CoordinateSetter>

                <View style={{
                    marginHorizontal: 20,
                    marginTop: 10,
                    marginBottom: 15,
                    opacity: (mode === treeFormModes.remoteEdit && disableButton) ? 0.5 : 1,
                }}>
                    <TouchableWithoutFeedback
                        style={{
                            backgroundColor: (mode === treeFormModes.remoteEdit && disableButton) ? "#696969" : "#04AA6D",
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 9,
                            borderRadius: 5
                        }}
                        onPress={() => {
                            console.log("mode: ", mode, "disable button: ", disableButton);

                            if (mode === treeFormModes.remoteEdit && disableButton) {
                                ToastAndroid.show(Strings.alertMessages.deleteImageEdit, ToastAndroid.SHORT);
                            } else {
                                pickImage();
                            }
                        }}
                    >
                        <Text style={{ color: 'white' }}>{Strings.buttonLabels.ClickPhoto}</Text>
                    </TouchableWithoutFeedback>
                </View>


                <View style={{ margin: 2, borderColor: '#5DB075', borderRadius: 5, flexDirection: 'column', backgroundColor: 'white' }}>

                    <FlatList
                        scrollEnabled={false}
                        data={[...exisitingImages, ...images]}
                        renderItem={renderImage}
                    />

                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 30, marginTop: 25, marginBottom: 10 }}>
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