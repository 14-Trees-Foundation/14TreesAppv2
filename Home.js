import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { Constants, Utils } from './Utils';
import { CustomButton } from './Components';


const HomeScreen = ({navigation}) => {
    const [syncDate, setSyncDate] = useState('');
    console.log('here')
    const getSyncDate = async () => {
        const value = await AsyncStorage.getItem(Constants.syncDateKey);
        if(value){
          setSyncDate(value);
        }
        else{
          setSyncDate('Never');
        }
    }
    useEffect(() => {
        getSyncDate();
    }, []);
    return (
        <View >
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

  