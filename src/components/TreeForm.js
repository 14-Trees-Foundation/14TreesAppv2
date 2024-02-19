import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, FlatList, ScrollView, Text, TextInput, View ,Modal,TouchableOpacity} from 'react-native';
import { Strings } from "../services/Strings";
import { Utils } from "../services/Utils";
import { CustomButton, ImageWithEditableRemark, ImageWithUneditableRemark } from "./Components";
import { CoordinateSetter } from "./CoordinateSetter";
import { CustomDropdown } from "./CustomDropdown";
import { commonStyles } from "../services/Styles";
import * as ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

export const treeFormModes = {
    addTree: 0,
    localEdit: 1,
    remoteEdit: 2
}

export const TreeForm = ({ treeData, onVerifiedSave, mode, onCancel, onNewImage, onDeleteImage }) => {
    const { inSaplingId, inLng, inLat, inImages, inTreeType, inPlot, inUserId } = treeData;
   
    const [saplingid, setSaplingId] = useState(inSaplingId);
    // console.log('saplingid: ',inSaplingId);
    const [lat, setlat] = useState(inLat);
    const [lng, setlng] = useState(inLng);
    // array of images
    const [exisitingImages, setExistingImages] = useState(inImages)
    const [localSaplingIds, setLocalSaplingIds] = useState([])
    const [liveSaplingIds,setLiveSaplingIds] = useState([])
    const [images, setImages] = useState([]);
    const [treeItems, setTreeItems] = useState([]);
    const [plotItems, setPlotItems] = useState([]);
    const [mainScrollEnabled, setMainScrollEnabled] = useState(true);
    const [selectedTreeType, setSelectedTreeType] = useState(inTreeType);
    const [selectedPlot, setSelectedPlot] = useState(inPlot);
    const [userId, setUserId] = useState(inUserId);
    const [modalVisible, setModalVisible] = useState(false);
    console.log('rendered treeform')
    useEffect(() => {
        console.log(treeData.inSaplingId)
        if (mode === treeFormModes.localEdit) {
            setExistingImages([]);
            console.log("---------treeData.inImages------------",treeData.inImages)
            setImages(treeData.inImages);
        }
    }, [treeData])
    const handleDeleteExistingItem = async (name) => {
        const newSetImages = exisitingImages.filter((item) => item.name !== name);
        if (onDeleteImage) {
            console.log("----new set images-----",newSetImages,"-----onDeleteImage-----",onDeleteImage,"------exisitingImages-----",exisitingImages)
            await onDeleteImage(name);
        }
        setExistingImages(newSetImages);
    }
    const handleDeleteItem = async (name) => {
        const newImages = images.filter((item) => item.name !== name);
        setImages(newImages);
    };
    const handleAddImage = async (image) => {
        if (onNewImage) {
            console.log("-------------in handleAddImage--------------")
            await onNewImage(image);
        }
        //setImages([...images, image]) //namrata;
        setImages([image]);
    }
    const onSave = async () => {
        console.log("Sapling id value : ",saplingid)
        if (localSaplingIds.includes(saplingid)) {
            Alert.alert(Strings.alertMessages.invalidSaplingId, Strings.labels.SaplingId + ' ' + saplingid + ' ' + Strings.alertMessages.alreadyExists);
            return;
        }
        else if(liveSaplingIds.includes(saplingid) && mode!==treeFormModes.remoteEdit){
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
                //setSelectedPlot({}); //to default the plot
                setImages([]);
                await onVerifiedSave(tree, images);
            } catch (error) {
                console.error(error);
            }
        };
    }

    //namrata
    
    const pickImage = async (selectionId) => {
        setModalVisible(false)
        let newImage = await Utils.getImage(true,selectionId);
        newImage = await Utils.formatImageForSapling(newImage, saplingid);
        await handleAddImage(newImage);
    };

    const clickPhotoEditRemoteTree = async() => {

    }
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
                    handleDeleteExistingItem(item.name);
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
        }
    }, []);
    useEffect(() => {
        loadDataCallback();
    }, []);
   
    return (
        <ScrollView keyboardShouldPersistTaps='handled' style={{ backgroundColor: '#5DB075', height: '100%' }} scrollEnabled={mainScrollEnabled}>
            <View style={{ backgroundColor: 'white', margin: 10, borderRadius: 10 }}>
                {
                    [
                        <View>
                            <TextInput
                                defaultValue={saplingid}
                                style={commonStyles.txtInput}
                                placeholder={Strings.labels.SaplingId}
                                placeholderTextColor={'black'}
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
                    showClearButton={true}
                />
                <CustomDropdown
                    initItem={selectedPlot}
                    items={plotItems}
                    label={Strings.labels.SelectPlot}
                    onSelectItem={setSelectedPlot}
                    showClearButton={true}
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
                <View style={{ marginHorizontal: 20, marginTop: 10, marginBottom: 15 }}>
                    
                    {/* <Button
                        title={Strings.buttonLabels.ClickPhoto}
                        //onPress={() => pickImage()}
                        //color={'#5DB075'}
                        color = {'#ECD942'}
                        //Namrata
                        
                    /> */}
                
                    <TouchableOpacity onPress={() => setModalVisible(true)}   style={{ backgroundColor: '#ECD942', padding: 10, borderRadius: 5, alignItems:"center", borderWidth:2,  marginTop : 0}} >
                        <Text style={{color:"black",fontWeight: 'bold'}}>{Strings.buttonLabels.ClickPhoto}</Text>
                    </TouchableOpacity>
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
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between',margin:10 }}>
                                    <Button title={Strings.buttonLabels.openCamera} onPress={() => pickImage(0)} color="green" // Change text color
                                    />
                                    <Button title={Strings.buttonLabels.openGallery}  onPress={() => pickImage(1)} color="green" // Change text color
                                    />
                                </View>
                                <TouchableOpacity style={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }} onPress={() => setModalVisible(false)}  >
                                    <Icon name="close-circle" size={25} color="green" /> 
                                </TouchableOpacity>
                            </View>
                            
                        </View>    
                    </Modal>

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