import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Constants, Utils } from './Utils';
import { CustomButton, MyIconStack } from './Components';
import LanguageModal from './Languagemodal';
import { Strings } from './Strings';
import * as Progress from 'react-native-progress';
import { SyncDisplay } from './SyncDisplay';

// strings 
// Never 
// Last Sync Data On :
// Sync Data
// Add New Tree
// Fetch Helper Data



const HomeScreen = ({ navigation }) => {
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [something, setSomething] = useState(''); 
  // console.log('here')
  

  const [progress, setProgress] = useState(0);

  const fetchdata = async () => {
    
    try{
      await Utils.fetchAndStoreHelperData((onProgressEvent) => {
        const progress = onProgressEvent.loaded / onProgressEvent.total;
        setProgress(progress);
      }
      );

    }
    catch(err){
      console.log(err);
    }
    // await Utils.fetchAndStorePlotSaplings();
  };

 

  // const test = async () => {
  //   console.log('test')
  //   // await Utils.fetchAndStorePlotSaplings();
  //   await Utils.getPlotSaplings();
    
  // }

  return (
    <View >
      {/* TODO: show status of synced/pending trees. */}
      {/* TODO: fix last sync date setting. */}
      <SyncDisplay/>
      <View style={{ margin: 20, marginTop: 50 }}>
        <Button
          title={Strings.buttonLabels.AddNewTree}
          onPress={() => navigation.navigate(Strings.screenNames.getString('AddTree',Strings.english))}
          color={'#5DB075'}
        />
      </View>
      {/* <View style={{ margin: 20 }}>
        <Button
          title={Strings.buttonLabels.FetchHelperData}
          onPress={fetchdata}
          color={'#5DB075'}
        />
      </View> */}
      {/* <View style={{ margin: 20 }}>
        <Button
          title={"test button"}
          onPress={test}
          color={'#5DB075'}
        />
      </View> */}

      <TouchableOpacity style={styles.selLang} onPress={() => {
        console.log('set your language')
        setLangModalVisible(!langModalVisible)
      }}>
        <Text style={{ color: '#36454F', fontWeight: 'bold' }}>{Strings.buttonLabels.SelectLanguage}</Text>
      </TouchableOpacity>
      <LanguageModal
        navigation={navigation}
        langModalVisible={langModalVisible}
        setLangModalVisible={setLangModalVisible}
        />
    </View>
  );
}



export default HomeScreen;

const styles = StyleSheet.create({
  headerText: {
    fontSize: 30, color: 'white', textAlign: 'center', marginTop: 30, marginBottom: 30, fontFamily: 'cochin', fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  selLang: {
    width: '50%',
    height: 50,
    borderWidth: 0.5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    alignSelf: 'center',
    backgroundColor: '#D3D3D3',
    borderColor: '#A9A9A9',
  }
});


// Utils code

