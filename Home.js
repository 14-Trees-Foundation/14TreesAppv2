import React, {useEffect,useState} from 'react';
import { View, Text, Button,  Alert, StyleSheet, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getDBConnection,getTreesByUploadStatus,updateUpload,getTreeImages } from './tree_db';
import { DataService } from './DataService';
import { Constants, Utils } from './Utils';


const HomeScreen = ({navigation}) => {
    const [syncDate, setSyncDate] = useState('');
    const getSyncDate = async () => {
        const value = await AsyncStorage.getItem(Constants.syncDateKey);
        console.log(value);
        setSyncDate(value);
    }
    useEffect(() => {
        getSyncDate();
    }, []);
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
                onPress={Utils.upload}
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
          {/* <View style={{margin:20, marginTop:50}}>
            <Button
              title="View Local Trees"
              onPress={() => navigation.navigate('LocalDataView')}
              color={'#5DB075'}
            />
          </View> */}
          <View style={{margin:20}}>
            <Button
                title="Fetch Helper Data"
                onPress={Utils.fetchAndStoreHelperData}
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

  