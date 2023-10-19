import { Utils, styles } from "./Utils";
import { useEffect,useState,useCallback } from 'react';
import {KeyboardAvoidingView,Alert,Text,Image,View,ToastAndroid,TouchableOpacity,TextInput, Button, FlatList} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { Dropdown } from "./DropDown";
import {launchCamera} from 'react-native-image-picker';
export const TreeForm = ({ treeData:{inSaplingId,inLng,inLat,inImages,inTreeType,inPlot,inUserId}, onVerifiedSave, updateUserId,navigation }) => {
    const [saplingid, setSaplingid] = useState(inSaplingId);
    const [lat, setlat] = useState(inLng);
    const [lng, setlng] = useState(inLat);
    const [keyboardAvoidingViewEnabled,setKeyboardAvoidingViewEnabled] = useState(false);
    // array of images
    const [images, setImages] = useState(inImages);
    const [treeItems, setTreeItems] = useState([]);
    const [plotItems, setPlotItems] = useState([]);

    const [selectedTreeType, setSelectedTreeType] = useState(inTreeType);
    const [selectedPlot, setSelectedPlot] = useState(inPlot);
    const [userId, setUserId] = useState(inUserId);
    let ldb;
    const handleDeleteItem = (name) => {
        const newImages = images.filter((item) => item.name !== name);
        setImages(newImages);
    };
    const onSave = async () => {
        if (saplingid === null || Object.keys(selectedTreeType).length === 0 || Object.keys(selectedPlot).length === 0) {
            Alert.alert('Error', 'Please fill all the fields');
            return;
        }
        else if (images.length === 0) {
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

                await onVerifiedSave(tree, images);

                // await fetch();
                // requestLocation();
                setSaplingid(null);
                setSelectedTreeType({});
                setSelectedPlot({});
                // setSelectedUser({});
                setImages([]);
                // await Utils.upload();
                ToastAndroid.show('Tree saved locally!', ToastAndroid.SHORT);
                navigation.navigate('Home');
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

                setImages([...images, {
                    saplingid: saplingid,
                    data: base64Data,
                    name: imageName,
                    meta: {
                        captureTimestamp: timestamp,
                        remark: 'default remark',
                    }
                }
                ]);
            }
        });
    };

    const renderImg = ({ item }) => {
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
            console.log('remark changed');
            for (let index = 0; index < images.length; index++) {
                console.log(images[index].meta.remark);
            }
        }
        const captureString = 'Captured at:\n' + item.meta.captureTimestamp.split('T').join('\n');
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
                    <Text style={{ ...styles.text3, textAlign: 'center' }}>{captureString}</Text>
                    <TouchableOpacity onPress={() => handleDeleteItem(item.name)}>
                        <Image
                            source={require('./assets/icondelete.png')} // Replace with your delete icon image
                            style={{ width: 20, height: 20, marginLeft: 10 }} // Adjust the icon dimensions and margin
                        />
                    </TouchableOpacity>
                </View>

                <View style={{}}>
                    <TextInput
                        style={styles.remark}
                        placeholder="Enter Remark"
                        placeholderTextColor={'#000000'}
                        onChangeText={(text) => changeimgremark(text)}
                        value={item.meta.remark}
                        onFocus={(e)=>{setKeyboardAvoidingViewEnabled(true);}}
                        onBlur={(e)=>{setKeyboardAvoidingViewEnabled(false);}}
                    />
                </View>
            </View>
        );
    }


    const loadDataCallback = useCallback(async () => {
        try {
            ldb = await Utils.setDBConnection();
            if(updateUserId){
                let userId = await Utils.getUserId();
                setUserId(userId);
            }
            let trees = await ldb.getTreesList();
            let plots = await ldb.getPlotsList();
            setTreeItems(trees);
            setPlotItems(plots);
            requestLocation();

            // setUserItems(users);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(()=>{loadDataCallback()}, []);

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
                <View style={{ backgroundColor: '#5DB075', borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
                    <Text style={styles.headerText}> Add Tree </Text>
                </View>
                <View style={{ backgroundColor: 'white', margin: 10, borderRadius: 10 }}>
                    <TextInput
                        style={styles.txtInput}
                        placeholder="sapling id"
                        placeholderTextColor={'#000000'}
                        onChangeText={(text) => setSaplingid(text)}
                        value={saplingid}
                    />
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
                            data={images}
                            renderItem={renderImg}
                        />
                    </View>
                    </KeyboardAvoidingView>
                    <View style={{ marginHorizontal: 30, marginTop: 25, marginBottom: 10 }}>
                        <Button
                            title="Submit"
                            onPress={onSave}
                            color={'#5DB075'}

                        />
                    </View>



                </View>
            </View>
        </KeyboardAvoidingView>
    )

}