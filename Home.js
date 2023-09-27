import React from 'react';
import { View, Text, Button} from 'react-native';
import axios from 'axios';
import {AsyncStorage} from '@react-native-async-storage/async-storage';

// Home screen has 
// 1. Header
// 2. Body


// Header has
// 1. Icon (Menu)

// Body has
// 1. button to : add new plant (navigate to AddTreeScreen)
// 2. button to : fetch tree type list from api
// 3. button to : fetch zone list from api
// 4. button to : sync data

const HomeScreen = ({navigation}) => {
    // var user_id = '';
    // const retrieveData = async () => {
    //     try {
    //       user_id = await AsyncStorage.getItem('userid');
    //       if (value !== null) {
    //         console.log('Retrieved data:', value);
    //       } else {
    //         console.log('No data found.');
    //       }
    //     } catch (error) {
    //       console.error('Error retrieving data:', error);
    //     }
    //   };
    //   retrieveData();
    // const fetchHelperData = () => {
    //     console.log('fetching helper data');
    //     const helperData = axios.post('https://5530-103-21-124-76.ngrok.io/api/v2/fetchHelperData',{
    //         userid: user_id
    //     });
    //     console.log(helperData);
    // }

    return (
        <View style={{ backgroundColor:'black', height: '100%'}}>
          <Text > Home </Text>
          <Button
              title="Add Tree"
              onPress={() => navigation.navigate('AddTree')}
          />

          <Button
              title="Fetch Helper Data"
              onPress={() => fetchHelperData()}
          />
        </View>
    );
}







export default HomeScreen;