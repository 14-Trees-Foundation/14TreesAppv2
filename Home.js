import React, {useEffect,useState} from 'react';
import { View, Text, Button, FlatList} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSaplingIds,getDBConnection,getTreesToUpload,updateUpload,getTreeImages } from './tree_db';

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
        const helperData = await axios.post('https://ebcb-103-21-124-76.ngrok.io/v2/fetchHelperData',{
            userId: user_id
        });
        console.log(helperData.data);
    }

    const upload = async () => {
        try {
            const db = await getDBConnection();
            let res = await getTreesToUpload(db);
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
            'https://ebcb-103-21-124-76.ngrok.io/api/v2/uploadTrees',
            final,
            );
            if (response.status === 200) {
            
            for(let index = 0; index < final.length; index++){
                const element = final[index];
                await updateUpload(db, element.sapling_id);
            }
            }
            console.log(response.data);
            // await fetch();
        }
        catch (error) {
          console.error(error);
        }
      }; 

    return (
        <View style={{ backgroundColor:'black', height: '100%'}}>
          <Text style={{fontSize: 20,color: '#ffffff',textAlign: 'center', marginBottom:40}} > Home </Text>
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
        <View style={{margin:20}}>
          <Button
              title="Upload"
              onPress={upload}
          />
        </View>
          
        </View>
    );
}

export default HomeScreen;
