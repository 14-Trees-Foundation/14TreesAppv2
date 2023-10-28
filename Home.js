import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Constants, Utils } from './Utils';
import { CustomButton } from './Components';
import LanguageModal from './Languagemodal';


// strings 
// Never 
// Last Sync Data On :
// Sync Data
// Add New Tree
// Fetch Helper Data



const HomeScreen = ({navigation}) => {
    const [syncDate, setSyncDate] = useState('');
    const [langModalVisible, setLangModalVisible] = useState(false);
    const [something, setSomething] = useState(true); // to re-render the component(jugaad)
    // console.log('here')
    useEffect(() => {
      console.log('refresh')
    }, [Utils.languages,syncDate]);

    
    const getSyncDate = async () => {
      const l = await AsyncStorage.getItem(Constants.selectedLangKey);
      console.log('lang: ',l);
        const value = await AsyncStorage.getItem(Constants.syncDateKey);
        if(value){
          setSyncDate(value);
        }
        else{
          setSyncDate(Utils.languages.Never);
        }
    }
    useEffect(() => {
        getSyncDate();
    }, []);
    
    return (
        <View >
          <Text style={{fontSize:20, marginTop:20, alignContent:'center', justifyContent:'center', alignSelf:'center', color:'black'}}>{Utils.languages.LastSyncDataOn}</Text>
          <Text style={{fontSize:20, alignContent:'center', justifyContent:'center', alignSelf:'center', color:'black'}}>{syncDate}</Text>

          <View style={{margin:20}}>
            <Button
                title={Utils.languages.SyncData}
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
              title={Utils.languages.AddNewTree}
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
                title={Utils.languages.FetchHelperData}
                onPress={Utils.fetchAndStoreHelperData}
                color={'#5DB075'}
            />
          </View>
          <TouchableOpacity style={styles.selLang} onPress={()=> {
        setLangModalVisible(!langModalVisible)
      }}>
        <Text style={{color:'#36454F', fontWeight:'bold'}}>{Utils.languages.SelectLanguage}</Text>
      </TouchableOpacity> 
      <LanguageModal 
        langModalVisible={langModalVisible} 
        setLangModalVisible={setLangModalVisible}
        onSelectLang={async (x)=>{
          await Utils.setLanguage(x);
          setSomething(!something); // to re-render the component(jugaad)
          // setSyncDate(Utils.languages.Never);
          // console.log('language changed to ',Utils.languages.SignIn);
        }}/>
         
          
        </View>
    );
}



export default HomeScreen;

const styles = StyleSheet.create({
    headerText: {
      fontSize: 30, color: 'white', textAlign: 'center', marginTop: 30, marginBottom: 30, fontFamily:'cochin', fontWeight:'bold' , textShadowColor: 'rgba(0, 0, 0, 0.5)', 
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3, 
    },
    selLang:{
      width:'50%',
      height:50,
      borderWidth:0.5,
      borderRadius:10,
      justifyContent:'center',
      alignItems:'center',
      marginTop:50,
      alignSelf:'center',
      backgroundColor:'#D3D3D3',
      borderColor:'#A9A9A9' 
    }
  });

  