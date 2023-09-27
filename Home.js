import React, {useEffect,useState} from 'react';
import { View, Text, Button, FlatList} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSaplingIds,getDBConnection } from './tree_db';

const HomeScreen = ({navigation}) => {
    // const user_id = getUserId();
    const [user_id, setUser_id] = React.useState(null);
    const getUserId = async () => {
        const value = await AsyncStorage.getItem('userid');
        setUser_id(value);
    }
    getUserId();
    // console.log('at home, user id is:');
    // console.log(user_id);

    // const [saplings, setSaplings] = useState([]);
    // const fetchSaplings = async () => {
    //     const db = await getDBConnection();
    //     const saplings = await getSaplingIds(db);
    //     setSaplings(saplings);
    // }
    // display sapling ids in the component

    // useEffect(() => {
    //     fetchSaplings();
    // },[saplings]);

    
    const fetchHelperData =async () => {
        console.log('fetching helper data');
        const helperData = await axios.post('https://d725-103-21-124-76.ngrok.io/api/v2/fetchHelperData',{
            userId: user_id
        });
        console.log(helperData.data);
    }



    return (
        <View style={{ backgroundColor:'black', height: '100%'}}>
          <Text style={{fontSize: 20,color: '#ffffff',textAlign: 'center'}} > Home </Text>
          <View style={{margin:20}}>
            <Button
              title="Add Tree"
              onPress={() => navigation.navigate('AddTree')}
            />
        </View>
        <View style={{margin:20}}>
          <Button
              title="Fetch Helper Data"
              onPress={fetchHelperData}
          />
        </View>
        <Text style={{fontSize: 20,color: '#ffffff',textAlign: 'center'}} > Saplings </Text>
        {/* <FlatList
            data={saplings}
            renderItem={({item}) => <Text style={{fontSize: 20,color: '#ffffff',textAlign: 'center'}}>{item}</Text>}
            keyExtractor={item => item}
        /> */}
          
        </View>
    );
}

export default HomeScreen;
