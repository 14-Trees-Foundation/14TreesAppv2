import React, {useEffect,useState} from 'react';
import { View, Text, Button,  Alert, StyleSheet, TouchableOpacity} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getDBConnection,getTreesToUpload,updateUpload,getTreeImages } from './tree_db';


const HomeScreen = ({navigation}) => {
    // const user_id = getUserId();
    const [user_id, setUser_id] = useState(null);
    const getUserId = async () => {
        const value = await AsyncStorage.getItem('userid');
  
        setUser_id(value);
    }
    getUserId();
    const [syncDate, setSyncDate] = useState('');
    const getSyncDate = async () => {
        const value = await AsyncStorage.getItem('date');
        console.log(value);
        setSyncDate(value);
    }
    useEffect(() => {
        getSyncDate();
    }, [syncDate]);

    const fetchHelperData =async () => {
        console.log('fetching helper data');
        const helperData = await axios.post('https://47e1-103-21-124-76.ngrok.io/v2/fetchHelperData',{
            userId: user_id
        });
        console.log(helperData.data);

        if (helperData.status === 200) {
            Alert.alert('Helper data fetched successfully');
        }
    }

    const upload = async () => {
        try {
            const db = await getDBConnection();
            let res = await getTreesToUpload(db);
            const currentTime = new Date().toString();
            await AsyncStorage.setItem('date',currentTime );
            // console.log(res);

            var final = [];
            for (let index = 0; index < res.length; index++) {
                var element = res[index];
                // if lat or lng is null, change it to 0
                if (element.lat === 'undefined') {
                    element.lat = 0;
                }
                if (element.lng === 'undefined') {
                    element.lng = 0;
                }
                console.log(element.lat, element.lng);
                const db = await getDBConnection();
                let images = await getTreeImages(db, element.sapling_id);
                for (let index = 0; index < images.length; index++) {
                console.log(images[index].name);
                }
          // console.log(element);
                const tree = {
                    sapling_id: element.sapling_id,
                    type_id: element.type_id,
                    plot_id: element.plot_id,
                    user_id: user_id,
                    coordinates: [element.lat,  element.lng],
                    images: images,
                };
                final.push(tree);
            }
  
            // console.log(final);
          
            let response = await axios.post(
            'https://47e1-103-21-124-76.ngrok.io/api/v2/uploadTrees',
            final,
            );
            if (response.status === 200) {
            
            for(let index = 0; index < final.length; index++){
                const element = final[index];
                await updateUpload(db, element.sapling_id);
                }
                Alert.alert('Upload successful');
            }
            console.log(response.data);
            await fetch();
        }
        catch (error) {
          console.error(error);
        }
      }; 

    return (
        <View >
          <View style={{backgroundColor:'#5DB075', borderBottomLeftRadius:10, borderBottomRightRadius:10}}>
            <Text style={styles.headerText} > Home </Text>
          </View>

          <Text style={{fontSize:20, marginTop:20, alignContent:'center', justifyContent:'center', alignSelf:'center', color:'black'}}>Last Sync Data On : </Text>
          <Text style={{fontSize:20, alignContent:'center', justifyContent:'center', alignSelf:'center', color:'black'}}>{syncDate}</Text>

          <View style={{margin:20}}>
            <Button
                title="Sync Data"
                onPress={upload}
                color={'#5DB075'}
                
            />
          </View>

          {/* <View>
            <TouchableOpacity
              style={{
                backgroundColor: 'blue',
                padding: 10,
                borderRadius: 5,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 16 }}>Click Me</Text>
            </TouchableOpacity>
          </View> */}
          
          <View style={{margin:20, marginTop:50}}>
            <Button
              title="Add New Tree"
              onPress={() => navigation.navigate('AddTree')}
              color={'#5DB075'}
            />
          </View>
          <View style={{margin:20}}>
            <Button
                title="Fetch Helper Data"
                onPress={fetchHelperData}
                color={'#5DB075'}
                
            />
          </View>
         
          
        </View>
    );
}

export default HomeScreen;

const styles = StyleSheet.create({
    headerText: {
      fontSize: 30, color: 'white', textAlign: 'center', marginTop: 30, marginBottom: 30, fontFamily:'cochin', fontWeight:'bold' , textShadowColor: 'rgba(0, 0, 0, 0.5)', 
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3, 
    }
  });

  