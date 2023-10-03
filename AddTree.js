// add tree screen

import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,Text,View,Image,Alert,Button,ScrollView,FlatList,TouchableOpacity,TextInput,Pressable,ToastAndroid
} from 'react-native';
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
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Constants, Utils } from './Utils';



const AddTreeScreen = ({navigation}) => {

    const [saplingid, setSaplingid] = React.useState(null);
    const [lat, setlat] = useState(0);
    const [lng, setlng] = useState(0);
    // array of images
    const [images, setImages] = useState([]);
    const [treeItems, setTreeItems] = useState([]);
    const [plotItems, setPlotItems] = useState([]);
    const [userItems, setUserItems] = useState([]);
    const [selectedTreeType, setSelectedTreeType] = useState({});
    const [selectedPlot, setSelectedPlot] = useState({});
    let userId = Utils.userId;
    //fetch userId from Async Storage.
    // AsyncStorage.getItem(Constants.userIdKey).then((userid)=>{
    //   userId = userid;
    // })
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
                
                setImages([...images, { saplingid:  saplingid,data:  base64Data, name: imageName }]);
            }
        });
    };
    
    const renderImg = ({ item }) => {
      return (
        <View  style={{margin:3, flexDirection:'row', flexWrap:'wrap'}}>
          <Image
            source={{ uri: `data:image/jpeg;base64,${item.data}` }}
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
    }

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
    
    const adddata = async () => {
      if(saplingid === null || Object.keys(selectedTreeType).length === 0 || Object.keys(selectedPlot).length === 0){
        Alert.alert('Error', 'Please fill all the fields');
        return;
      }
      else if(images.length === 0){
        Alert.alert('Error', 'Please add atleast one image');
        return;
      }
      else{
        try {
          await requestLocation();
          const tree = {
            treeid: selectedTreeType.value,
            saplingid: saplingid,
            lat: lat,
            lng: lng,
            plotid: selectedPlot.value,
            user_id: userId,
          };
          // call saveTreeImages for each image
          
          const db = await getDBConnection();
          await saveTrees(db, tree, 0);
          for (let index = 0; index < images.length; index++) {
            const element = {
              saplingid : images[index].saplingid,
              image : images[index].data,
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
          // await Utils.upload();
          ToastAndroid.show('Tree saved locally!',ToastAndroid.SHORT);
          navigation.navigate('Home');
        } catch (error) {
          console.error(error);
        }
      };
      }
      

    return (
    
   <View style={{backgroundColor:'#5DB075', height:'100%'}}>
        <View style={{backgroundColor:'#5DB075', borderBottomLeftRadius:10, borderBottomRightRadius:10}}> 
        <Text style={styles.headerText}> Add Tree </Text>
        </View>
      <View style={{backgroundColor:'white', margin: 10,borderRadius:10}}>
          <TextInput
              style={styles.txtInput}
              placeholder="sapling id"
              placeholderTextColor={'#000000'}
              onChangeText={(text) => setSaplingid(text)}
              value={saplingid}
          />
          {/* <Dropdown
            items={userItems}
            label="Select user"
            setSelectedItems={setSelectedUser}
            selectedItem={selectedUser}
          /> */}
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
          <Text style={{color:'black', marginLeft:20, margin:10, fontSize:18}}> Coordinates : {lat},{lng}</Text>
          <View style={{marginHorizontal:20, marginTop:10, marginBottom:15}}>
          <Button
                title="Add Photo"
                onPress={() => pickImage()}
                color={'#5DB075'}
            />
          </View>
          
          <View style={{flexDirection:'row', flexWrap:'wrap' }}> 
            <FlatList
                data={images}
                numColumns={3}
                renderItem={renderImg}
            />
          </View>

          <View style={{margin:30, marginTop:60, marginBottom:40}}>
            <Button
                title="Submit"
                onPress={adddata}
                color={'#5DB075'}
                
            />
          </View>

          {/* <View style={styles.btnview}>
              <Pressable
                android_ripple={{ color: '#5DB071', borderless: false }}
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
                <Text style={styles.btntxt}>Submit</Text>
              </Pressable>
            </View> */}
          <View style={{ padding:12,borderRadius: 5}}>
          {/* <Button
                title="get location"
                onPress={() => requestLocation()}
            /> */}
          </View>
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
      height: 60,
      width: 310,
      borderWidth: 0.5,
      borderColor: 'grey',
      borderRadius: 10,
      backgroundColor: '#f5f5f5',
      marginTop: 30,
      marginBottom: 10,
      padding: 10,
      color: 'black', // Change font color here
      fontSize: 16,
      fontWeight: 'bold',  
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
    },
    headerText: {
      fontSize: 30, color: 'white', textAlign: 'center', marginTop: 30, marginBottom: 30, fontFamily:'cochin', fontWeight:'bold' , textShadowColor: 'rgba(0, 0, 0, 0.5)', 
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3, 
    }
  });

export default AddTreeScreen;