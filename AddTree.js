// add tree screen

import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Alert,
  Button,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Pressable,
} from 'react-native';
import axios from 'axios';
import { Dropdown } from './DropDown';
import {
  getDBConnection,
  createTable,
  getTreesToUpload,
  saveTrees,
  updateUpload,
  getAllTreeCount,
  getTreesList,
  getPlotsList,
  getUsersList,
  getTreeImages,
  saveTreeImages,
} from './tree_db';
// import * as ImagePicker from 'react-native-image-picker';
import {launchCamera} from 'react-native-image-picker';
import { Location } from './get_location';
const AddTreeScreen = ({navigation}) => {

    const [saplingid, setSaplingid] = React.useState(null);
    const [lat, setlat] = useState(null);
    const [lng, setlng] = useState(null);
    // array of images
    const [images, setImages] = useState([]);
    const [treeItems, setTreeItems] = useState([]);
    const [plotItems, setPlotItems] = useState([]);
    const [userItems, setUserItems] = useState([]);
    const [selectedTreeType, setSelectedTreeType] = useState({});
    const [selectedPlot, setSelectedPlot] = useState({});
    const [selectedUser, setSelectedUser] = useState({});
    
    // image handle---------------------  
    const pickImage  = () => {
        const options = {
            mediaType: 'photo',
            includeBase64: true,
            maxHeight: 200,
            maxWidth: 200,
        };

        launchCamera(options,async (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                const timestamp = new Date().toISOString();
                // const imagePath = response.uri.replace('file://', '');
                const base64Data = response.assets[0].base64;
                
                // ImgToBase64.getBase64String(imagePath)
                //     .then(base64String => {
                //         // console.log(base64String);
                //         return base64String;
                //     })
                //     .catch(err => console.log(err));
                // const base64Data = 'data:image/jpeg;base64,'+await ImgToBase64.getBase64String(imagePath);
                
                const imageName = `${saplingid}_${timestamp}.jpg`;
                
                setImages([...images, { saplingid:  saplingid,Data:  base64Data, name: imageName }]);
            }
        });
    };
    
    const renderImg = ({ item }) => (
      <View  style={{margin:3, flexDirection:'row', flexWrap:'wrap'}}>
        <Image
          source={{ uri: `data:image/jpeg;base64,${item.Data}` }}
          style={{ width: 100, height: 100, }} // Set your desired image dimensions and margin
        />
        {/* <TouchableOpacity onPress={() => onDeleteItem(item.id)}>*/}
        <TouchableOpacity onPress={() => handleDeleteItem(item.name)}>
          <Image
            source={require('./assets/icondelete.png')} // Replace with your delete icon image
            style={{ width: 20, height: 20,}} // Adjust the icon dimensions and margin
          /> 
        </TouchableOpacity>
      </View>
    );

    const handleDeleteItem = (name) => {
      const newImages = images.filter((item) => item.name !== name);
      setImages(newImages);
    };

    const loadDataCallback = useCallback(async () => {
      try {
        const db = await getDBConnection();
        await createTable(db);
        // await fetch();
        requestLocation();
        let trees = await getTreesList(db);
        let plots = await getPlotsList(db);
        let users = await getUsersList(db);
        setTreeItems(trees);
        setPlotItems(plots);
        setUserItems(users);
      } catch (error) {
        console.error(error);
      }
    }, []);
  
    useEffect(() => {
      loadDataCallback();
    }, [loadDataCallback]);

    // const fetch = useCallback(async () => {
    //   try {
    //     const db = await getDBConnection();
    //     let res = await getTreesToUpload(db);
    //     // let res2 = await getAllTreeCount(db);
    //     // setTotal(res2);
    //     // setNotUploaded(res.length);
    //     return res;
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }, []);

    const requestLocation = async () => {
      try {
        let loc = await Location();
        setlat(loc.latitude);
        setlng(loc.longitude);
      } catch (code) {
        if (code === 'CANCELLED') {
          Alert.alert('Location cancelled by user or by another request');
        }
        if (code === 'UNAVAILABLE') {
          Alert.alert('Location service is disabled or unavailable');
        }
        if (code === 'TIMEOUT') {
          Alert.alert('Location request timed out');
        }
        if (code === 'UNAUTHORIZED') {
          Alert.alert('Authorization denied! Restart and allow Location access');
        }
      }
    };

    const adddata = async () => {
      try {
        requestLocation();
        const tree = {
          treeid: selectedTreeType.value,
          saplingid: saplingid,
          lat: lat,
          lng: lng,
          plotid: selectedPlot.value,
          user_id: selectedUser.user_id,
        };
        // call saveTreeImages for each image
        
        const db = await getDBConnection();
        await saveTrees(db, tree, 0);
        for (let index = 0; index < images.length; index++) {
          const element = {
            saplingid : images[index].saplingid,
            image : images[index].Data,
            imageid : images[index].name,
          };
          await saveTreeImages(db, element);
        }
        
        // await fetch();
        // requestLocation();
        // setSaplingid(null);
        // setSelectedTreeType({});
        // setSelectedPlot({});
        // setSelectedUser({});
        // setImages([]);
        navigation.navigate('Home');
        // await upload();
      } catch (error) {
        console.error(error);
      }
    };

    return (
    
   <View style={{backgroundColor:'black', height:'100%'}}>
        <Text style={styles.text2}> Add Tree </Text>
        <TextInput
            style={styles.txtInput}
            placeholder="sapling id"
            placeholderTextColor={'#000000'}
            onChangeText={(text) => setSaplingid(text)}
            value={saplingid}
        />
        <Dropdown
          items={userItems}
          label="Select user"
          setSelectedItems={setSelectedUser}
          selectedItem={selectedUser}
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
        <View style={{ padding:12,borderRadius: 5}}>
        <Button
              title="Add Photo"
              onPress={() => pickImage()}
          />
        </View>
         
        <View style={{flexDirection:'row', flexWrap:'wrap' }}> 
          <FlatList
              data={images}
              numColumns={3}
              renderItem={renderImg}
          />
        </View>

        <View style={styles.btnview}>
            <Pressable
              android_ripple={{ color: 'green', borderless: false }}
              style={
                saplingid !== null &&
                  Object.keys(selectedTreeType).length !== 0 &&
                  Object.keys(selectedPlot).length !== 0
                  ? styles.btn
                  : styles.btndisabled
              }
              onPress={() => adddata()}
              disabled={
                saplingid !== null &&
                  Object.keys(selectedTreeType).length !== 0 &&
                  Object.keys(selectedPlot).length !== 0
                  ? false
                  : true
              }>
              <Text style={styles.btntxt}>Add Tree Data</Text>
            </Pressable>
          </View>
          
          <View style={{ padding:12,borderRadius: 5}}>
        <Button
              title="upload log"
              onPress={() => upload()}
          />
        </View>

   </View>

    );
}

const styles = StyleSheet.create({
    btnview: {
      justifyContent: 'center',
      elevation: 3,
      marginHorizontal: 20,
      marginVertical: 10,
    },
    btn: {
      paddingHorizontal: 20,
      borderRadius: 9,
      backgroundColor: '#1f3625',
      alignItems: 'center',
      paddingVertical: 12,
      height: 50,
    },
    btndisabled: {
      paddingHorizontal: 20,
      borderRadius: 9,
      backgroundColor: '#686868',
      alignItems: 'center',
      paddingVertical: 12,
      height: 50,
    },
    text: {
      fontSize: 14,
      color: '#1f3625',
      textAlign: 'center',
    },
    text2: {
      fontSize: 25,
      color: 'white',
      textAlign: 'center',
      marginVertical: 5,
      marginBottom: 40,
    },
    recordTxt: {
      fontSize: 18,
      color: '#1f3625',
      marginTop: 5,
      marginBottom: 5,
      textAlign: 'center',
    },
    btntxt: {
      fontSize: 18,
      color: '#ffffff',
      textAlign: 'center',
    },
    txtInput: {
      borderRadius: 10,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#000000',
      marginHorizontal: 10,
      marginVertical: 5,
      paddingLeft: 20,
      color: '#1f3625',
    },
  });

export default AddTreeScreen;