// add tree screen

import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Alert,
  Button,
  ActivityIndicator,
    FlatList,
    TouchableOpacity,
  TextInput,
  Pressable,
  TouchableHighlight,
} from 'react-native';
import axios from 'axios';
import { Dropdown } from '../components/Dropdown';
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
  saveTreeImages
} from './tree_db';
// import * as ImagePicker from 'react-native-image-picker';
import ImgToBase64 from 'react-native-image-base64';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
const AddTreeScreen = ({navigation}) => {

    const [saplingid, setSaplingid] = React.useState(null);
    const [lat, setlat] = useState(null);
    const [lng, setlng] = useState(null);
    // array of images
    const [images, setImages] = useState([]);

   
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
                    
                    setImages([...images, { name: imageName, base64Data, saplingid }]);
                    console.log(base64Data);
                }
            });
        };
    

    return (
    
   <View>
        <Text style={styles.text2}> Add Tree </Text>
        <TextInput
            style={styles.txtInput}
            placeholder="sapling id"
            placeholderTextColor={'#000000'}
            onChangeText={(text) => setSaplingid(text)}
            value={saplingid}
        />
        <Text style={styles.text2}> 
            add photos
        </Text>
        <Button
            title="Add Photo"
            onPress={() => pickImage()}
        />
   </View>

    );
}

const styles = StyleSheet.create({
    container: {
      marginTop: 60,
      justifyContent: 'center',
    },
    image: {
      width: 80,
      height: 80,
      borderRadius: 20,
      marginHorizontal: 160,
    },
    btnview: {
      justifyContent: 'center',
      elevation: 3,
      marginHorizontal: 20,
      marginVertical: 3,
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
      fontSize: 18,
      color: '#1f3625',
      textAlign: 'center',
      marginVertical: 5,
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
      marginVertical: 3,
      paddingLeft: 20,
      color: '#1f3625',
    },
  });

export default AddTreeScreen;