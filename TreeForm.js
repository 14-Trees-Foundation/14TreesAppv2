import { Utils, commonStyles } from "./Utils";
import { useEffect,useState,useCallback } from 'react';
import {KeyboardAvoidingView,Alert,Text,Image,View,ToastAndroid,ScrollView,TouchableOpacity,TextInput, Button, FlatList,StyleSheet} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {launchCamera, } from 'react-native-image-picker';
import { CustomButton } from "./Components";
import { CustomDropdown } from "./CustomDropdown";
import { Strings } from "./Strings";
import { CoordinateSetter } from "./CoordinateSetter";
import ImageResizer from "react-native-image-resizer";
import RNFS from 'react-native-fs';
export const TreeForm = ({ treeData, onVerifiedSave, editMode, onCancel, onNewImage, onDeleteImage }) => {
    const {inSaplingId,inLng,inLat,inImages,inTreeType,inPlot,inUserId} = treeData;
    const [saplingid,setSaplingId] = useState(inSaplingId);
    const [lat, setlat] = useState(inLat);
    const [lng, setlng] = useState(inLng);
    // array of images
    const [exisitingImages,setExistingImages] = useState(inImages)
    const [images, setImages] = useState([]);
    const [treeItems, setTreeItems] = useState([]);
    const [plotItems, setPlotItems] = useState([]);
    const [mainScrollEnabled,setMainScrollEnabled] = useState(true);
    const [selectedTreeType, setSelectedTreeType] = useState(inTreeType);
    const [selectedPlot, setSelectedPlot] = useState(inPlot);
    const [userId, setUserId] = useState(inUserId);

    let ldb;
    const handleDeleteExistingItem = async (name)=>{
        const newSetImages = exisitingImages.filter((item)=>item.name!==name);
        if(onDeleteImage){
            await onDeleteImage(name);
        }
        setExistingImages(newSetImages);
    }
    const handleDeleteItem = async (name) => {
        const newImages = images.filter((item) => item.name !== name);
        setImages(newImages);
    };
    const handleAddImage = async (image)=>{
        if(onNewImage){
            await onNewImage(image);
        }
        setImages([...images, image]);
    }
    const onSave = async () => {
        const tree = {
            treeid: selectedTreeType.value,
            saplingid: saplingid,
            lat: lat,
            lng: lng,
            plotid: selectedPlot.value,
            user_id: userId,
        };
        console.log(tree);
        if (saplingid === null || Object.keys(selectedTreeType).length === 0 || Object.keys(selectedPlot).length === 0) {
            Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.IncompleteFields);
            return;
        }
        else if (images.length+exisitingImages.length === 0) {
            Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.NoImage);
            return;
        }
        else {
            try {

                // call saveTreeImages for each image

                // await fetch();
                setSaplingId('');
                setSelectedTreeType({});
                setSelectedPlot({});
                // setSelectedUser({});
                setImages([]);
                await onVerifiedSave(tree, images);
                // await Utils.upload();
            } catch (error) {
                console.error(error);
            }
        };
    }
    const pickImage = () => {
        const options = {
            mediaType: 'photo',
            includeBase64: true,
            maxHeight: 200,
            maxWidth: 200,
        };

        

        launchCamera(options, async (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                // const { fileSize } = response.assets[0];
                // 
                const timestamp = new Date().toISOString();
                const imageName = `${saplingid}_${timestamp}.jpg`;
                // only show time and not date
                const filesz = response.assets[0].fileSize;
                var base64Data = response.assets[0].base64;

                console.log("original file size: ", filesz);
                let maxsz = 1024 * 10;
                if(filesz>maxsz){
                    // let compressedQuality = -5.536/10000000*filesz*filesz + 0.0128*filesz + 100;
                    let compressedQuality = -0.00166*filesz + 129.74;
                    // let compressedQuality = 93;
                    if(filesz<17000)
                    {
                        if(filesz<14000)
                        {
                            compressedQuality = 98;
                        }
                        else if(filesz<15500){
                            compressedQuality = 97;
                        }
                        else if(filesz<17000){
                            compressedQuality = 96;
                        }

                    }
                    
                    if(compressedQuality<(maxsz/filesz)*100){
                        compressedQuality = (maxsz/filesz)*100;

                    }
                    
                    // const compressedQuality = 75;
                    console.log("compressed quality: ", compressedQuality);
                    const resizedImage = await ImageResizer.createResizedImage(
                        response.assets[0].uri,
                        200,
                        200,
                        'JPEG',
                        compressedQuality,
                    );
                    const resizedImagePath = resizedImage.uri;
                    
                    RNFS.readFile(resizedImagePath, 'base64')
                      .then((resizedbase64Data) => {
                        // Handle the base64 data
                        base64Data = resizedbase64Data;
                        // console.log(base64Data);
                      })
                      .catch((error) => {
                        // Handle any errors while reading the file
                        console.error('Error reading file:', error);
                      });
                    
                    console.log("resized image: ", resizedImage.size);
                    console.log('off factor', maxsz/resizedImage.size);
                }
                   
                // console.log("base64Data: ", base64Data);

                 
                const newImage = {
                    saplingid: saplingid,
                    data: base64Data,
                    name: imageName,
                    meta: {
                        capturetimestamp: timestamp,
                        remark: 'default remark',
                    }
                };
                await handleAddImage(newImage);
            }
        });
    };
    const renderExistingImage = ({item,index})=>{
        const indexString = `(${index+1} of ${exisitingImages.length+images.length})\n`
        console.log(item.meta);
        const captureString = Strings.languages.CapturedAt + ' :\n' + item.meta.capturetimestamp.split('T').join('\n');
        const displayString = `${indexString} ${captureString}`
        return (
            <View style={{
                marginHorizontal: 10,
                marginVertical: 4,
                borderWidth: 2,
                borderColor: '#5DB075',
                borderRadius: 10,
                flexDirection: 'column',
            }}>
                <View style={{ margin: 5, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <Image
                        source={{ uri: `data:image/jpeg;base64,${item.data}` }}
                        style={{ width: 100, height: 100, }} // Set your desired image dimensions and margin
                    />
                    <Text style={{ ...commonStyles.text3, textAlign: 'center' }}>{displayString}</Text>
                    <TouchableOpacity onPress={() => Utils.confirmAction(()=>handleDeleteExistingItem(item.name),'Delete image?')}>
                        <Image
                            source={require('./assets/icondelete.png')} // Replace with your delete icon image
                            style={{ width: 20, height: 20, marginLeft: 10 }} // Adjust the icon dimensions and margin
                        />
                    </TouchableOpacity>
                </View>

                <View style={{}}>
                    <Text style={commonStyles.text4}>
                        Remark: {item.meta.remark}
                    </Text>
                </View>
            </View>
        );
    }

    const renderImg = ({ item, index }) => {
        const changeimgremark = (text) => {
            const newImages = images.map((image) => {
                if (image.name === item.name) {
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
        const indexString = `(${index+1} of ${exisitingImages.length+images.length})\n`
        // console.log(item.meta);
        const captureString = 'Captured at:\n' + Utils.getReadableDate(item.meta.capturetimestamp);
        const displayString = `${indexString} ${captureString}`
        return (
            <View style={{
                marginHorizontal: 10,
                marginVertical: 4,
                borderWidth: 2,
                borderColor: '#5DB075',
                borderRadius: 10,
                flexDirection: 'column',
            }}>
                <View style={{ margin: 5, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <Image
                        source={{ uri: `data:image/jpeg;base64,${item.data}` }}
                        style={{ width: 100, height: 100, }} // Set your desired image dimensions and margin
                    />
                    <Text style={{ ...commonStyles.text3, textAlign: 'center' }}>{displayString}</Text>
                    <TouchableOpacity onPress={() => Utils.confirmAction(()=>handleDeleteItem(item.name),'Delete image?')}>
                        <Image
                            source={require('./assets/icondelete.png')} // Replace with your delete icon image
                            style={{ width: 20, height: 20, marginLeft: 10 }} // Adjust the icon dimensions and margin
                        />
                    </TouchableOpacity>
                </View>

                <View style={{}}>
                    {
                        item.name.startsWith('http')?
                        <Text style={commonStyles.text4}>
                            Remark: {item.meta.remark}
                        </Text>
                        :<TextInput
                        style={commonStyles.remark}
                        placeholder="Enter Remark"
                        placeholderTextColor={'#000000'}
                        onChangeText={(text) => changeimgremark(text)}
                        value={item.meta.remark}
                    />
                    }
                </View>
            </View>
        );
    }
    const commonRenderFunction = ({item,index})=>{
        if(index<exisitingImages.length){
            return renderExistingImage({item,index});
        }
        return renderImg({item,index});
    }

    const loadDataCallback = useCallback(async () => {
        try {
            ldb = await Utils.setDBConnection();
            if(editMode!==true){
                let userId = await Utils.getUserId();
                setUserId(userId);
            }
            let trees = await ldb.getTreesList();
            let plots = await ldb.getPlotsList();
            setTreeItems(trees);
            setPlotItems(plots);
            console.log(editMode, 'editmode');
            console.log('options loaded: ',trees.length,plots.length)
            // setUserItems(users);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(()=>{
        loadDataCallback();
    }, []);
    const requestLocation = async () => {
        console.log('requesting location');
        // TODO: handler
        Geolocation.getCurrentPosition(
            (position) => {
                setlat(position.coords.latitude);
                setlng(position.coords.longitude);
                console.log(lat);
                console.log(lng);
            },
            (error) => {
                Alert.alert('Error', 'Have you turned on the location (GPS) on your phone?');
            },
            { enableHighAccuracy: false, timeout: 2000 },
        );

    };
    const getReadableLocation = (lat,lng)=>{
        const latval = Math.round(lat*100)/100
        const lngval = Math.round(lng*100)/100
        return `${latval},${lngval}`
    }

    return (
        <ScrollView style={{ backgroundColor: '#5DB075', height: '100%' }} scrollEnabled={mainScrollEnabled}>
            <View style={{ backgroundColor: 'white', margin: 10, borderRadius: 10 }}>
                {
                    editMode === true ?
                        <Text style={{ ...commonStyles.text4, textAlign: 'center' }}>
                            Sapling ID: {saplingid}
                        </Text>
                        : <TextInput
                            style={commonStyles.txtInput}
                            placeholder={Strings.labels.SaplingId}
                            placeholderTextColor={'#000000'}
                            onChangeText={(text) => { setSaplingId(text) }}
                        />
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
                {/* <Text style={styles.text2}> Add photos</Text> */}
                <CoordinateSetter
                    editMode={editMode}
                    inLat={inLat}
                    inLng={inLng}
                    onSetLat={setlat}
                    onSetLng={setlng}
                    setOuterScrollEnabled={setMainScrollEnabled}
                    plotId={selectedPlot?selectedPlot.value:undefined}
                ></CoordinateSetter>
                <View style={{ marginHorizontal: 20, marginTop: 10, marginBottom: 15 }}>
                    <Button
                        title={Strings.buttonLabels.ClickPhoto}
                        onPress={() => pickImage()}
                        color={'#5DB075'}
                    />
                </View>
                    <View style={{ margin: 2, borderColor: '#5DB075', borderRadius: 5, flexDirection: 'column', backgroundColor: 'white' }}>
                        <FlatList
                            scrollEnabled={false}
                            data={[...exisitingImages, ...images]}
                            renderItem={commonRenderFunction}
                        />
                    </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 30, marginTop: 25, marginBottom: 10 }}>
                    {
                        (onCancel !== undefined)
                        &&
                        <CustomButton text='Cancel' onPress={onCancel} opacityStyle={{ backgroundColor: 'red' }} />
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