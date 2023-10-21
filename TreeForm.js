import { Utils, styles } from "./Utils";
import { useEffect,useState,useCallback } from 'react';
import {KeyboardAvoidingView,Alert,Text,Image,View,ToastAndroid,TouchableOpacity,TextInput, Button, FlatList} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { Dropdown } from "./DropDown";
import {launchCamera} from 'react-native-image-picker';
import { CustomButton } from "./Components";
export const TreeForm = ({ treeData, onVerifiedSave, editMode, onCancel, onNewImage, onDeleteImage }) => {
    const {inSaplingId,inLng,inLat,inImages,inTreeType,inPlot,inUserId} = treeData;
    const [saplingid, setSaplingid] = useState(inSaplingId);
    const [lat, setlat] = useState(inLng);
    const [lng, setlng] = useState(inLat);
    const [keyboardAvoidingViewEnabled,setKeyboardAvoidingViewEnabled] = useState(false);
    // array of images
    const [exisitingImages,setExistingImages] = useState(inImages)
    const [images, setImages] = useState([]);
    const [treeItems, setTreeItems] = useState([]);
    const [plotItems, setPlotItems] = useState([]);

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
        if (saplingid === null || Object.keys(selectedTreeType).length === 0 || Object.keys(selectedPlot).length === 0) {
            Alert.alert('Error', 'Please fill all the fields');
            return;
        }
        else if (images.length+exisitingImages.length === 0) {
            Alert.alert('Error', 'Please add atleast one image');
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
                // call saveTreeImages for each image

                
                // await fetch();
                // requestLocation();
                setSaplingid(null);
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
                const timestamp = new Date().toISOString();
                // only show time and not date

                const base64Data = response.assets[0].base64;
                const imageName = `${saplingid}_${timestamp}.jpg`;
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
        const captureString = 'Captured at:\n' + item.meta.capturetimestamp.split('T').join('\n');
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
                    <Text style={{ ...styles.text3, textAlign: 'center' }}>{displayString}</Text>
                    <TouchableOpacity onPress={() => Utils.confirmAction(()=>handleDeleteExistingItem(item.name),'Delete image?')}>
                        <Image
                            source={require('./assets/icondelete.png')} // Replace with your delete icon image
                            style={{ width: 20, height: 20, marginLeft: 10 }} // Adjust the icon dimensions and margin
                        />
                    </TouchableOpacity>
                </View>

                <View style={{}}>
                    <Text style={styles.text4}>
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
        console.log(item.meta);
        const captureString = 'Captured at:\n' + item.meta.capturetimestamp.split('T').join('\n');
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
                    <Text style={{ ...styles.text3, textAlign: 'center' }}>{displayString}</Text>
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
                        <Text style={styles.text4}>
                            Remark: {item.meta.remark}
                        </Text>
                        :<TextInput
                        style={styles.remark}
                        placeholder="Enter Remark"
                        placeholderTextColor={'#000000'}
                        onChangeText={(text) => changeimgremark(text)}
                        value={item.meta.remark}
                        onFocus={(e)=>{setKeyboardAvoidingViewEnabled(true);}}
                        onBlur={(e)=>{setKeyboardAvoidingViewEnabled(false);}}
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
            if(editMode!==true){
                requestLocation();
            }
            // setUserItems(users);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(()=>{
        loadDataCallback();
        console.log(selectedTreeType);
    }, []);

    const requestLocation = async () => {
        console.log('requesting location');
        Geolocation.getCurrentPosition(
            (position) => {
                setlat(position.coords.latitude);
                setlng(position.coords.longitude);
                console.log(lat);
                console.log(lng);
            },
            (error) => {
                error => Alert.alert('Error', JSON.stringify(error));
            },
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 },
        );

    };


    return (
        <KeyboardAvoidingView behavior='height' style={{ backgroundColor: '#5DB075' }} keyboardVerticalOffset={100}>
            <View style={{ backgroundColor: '#5DB075', height: '100%' }}>
                <View style={{ backgroundColor: 'white', margin: 10, borderRadius: 10 }}>
                    {
                        editMode===true?
                        <Text style={{...styles.text4,textAlign:'center'}}>
                            Sapling ID: {saplingid}
                        </Text>
                        :<TextInput
                        style={styles.txtInput}
                        placeholder="sapling id"
                        placeholderTextColor={'#000000'}
                        onChangeText={(text) => setSaplingid(text)}
                        value={saplingid}
                    />
                    }
                    <Dropdown
                        items={treeItems}
                        label="Select Tree Type"
                        setSelectedItems={setSelectedTreeType}
                        selectedItem={selectedTreeType}
                    />
                    <Dropdown
                        items={plotItems}
                        label="Select Plot"
                        setSelectedItems={setSelectedPlot}
                        selectedItem={selectedPlot}
                    />
                    {/* <Text style={styles.text2}> Add photos</Text> */}
                    <Text style={{ color: 'black', marginLeft: 20, margin: 10, fontSize: 18 }}> Coordinates : {lat},{lng}</Text>
                    <View style={{ marginHorizontal: 20, marginTop: 10, marginBottom: 15 }}>
                        <Button
                            title="Add Photo"
                            onPress={() => pickImage()}
                            color={'#5DB075'}
                        />
                    </View>

                    <KeyboardAvoidingView behavior="position" style={{}} keyboardVerticalOffset={150} enabled={keyboardAvoidingViewEnabled}>
                    <View style={{ height: 200, margin: 2, borderColor: '#5DB075', borderRadius: 5, flexDirection: 'column', backgroundColor:'white'}}>
                        <FlatList
                            data={[...exisitingImages,...images]}
                            renderItem={commonRenderFunction}
                        />
                    </View>
                    </KeyboardAvoidingView>
                    <View style={{ flexDirection:'row',justifyContent:'space-around',marginHorizontal: 30, marginTop: 25, marginBottom: 10 }}>
                        {
                            (onCancel!==undefined)
                            &&
                            <CustomButton text='Cancel' onPress={onCancel} opacityStyle={{backgroundColor:'red'}}/>
                        }
                        <CustomButton
                            text="Submit"
                            onPress={onSave}
                        />
                    </View>



                </View>
            </View>
        </KeyboardAvoidingView>
    )

}