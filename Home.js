import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Constants, Utils } from './Utils';
import { CustomButton, MyIconStack } from './Components';
import LanguageModal from './Languagemodal';
import { Strings } from './Strings';


// strings 
// Never 
// Last Sync Data On :
// Sync Data
// Add New Tree
// Fetch Helper Data



const HomeScreen = ({ navigation }) => {
  const [syncDate, setSyncDate] = useState('');
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [something, setSomething] = useState(true); // to re-render the component(jugaad)
  // console.log('here')
  const getSyncDate = async () => {
    const l = await AsyncStorage.getItem(Constants.selectedLangKey);
    console.log('lang: ', l);
    const value = await AsyncStorage.getItem(Constants.syncDateKey);
    if (value) {
      setSyncDate(value);
    }
    else {
      setSyncDate(Strings.languages.Never);
    }
  }
  useEffect(() => {
    getSyncDate();
    console.log('sync date updated')
  }, []);

  const fetchdata = async () => {
    await Utils.fetchAndStoreHelperData();
    await Utils.fetchAndStorePlotSaplings();
  }

  return (
    <View >
       <Text style={{ fontSize: 20, marginTop: 20, alignContent: 'center', justifyContent: 'center', alignSelf: 'center', color: 'black' }}>{Strings.languages.LastSyncDataOn}</Text>
      <Text style={{ fontSize: 20, alignContent: 'center', justifyContent: 'center', alignSelf: 'center', color: 'black' }}>{syncDate}</Text>
      {/* TODO: show status of synced/pending trees. */}
      {/* TODO: fix last sync date setting. */}
      {/* TODO: separate to sync component with progress bar and batch processing. */}
      <View style={{ margin: 20 }}>
        <Button
          title={Strings.buttonLabels.SyncData}
          onPress={Utils.upload}
          color={'#5DB075'}
        />
      </View>
      <View style={{ margin: 20, marginTop: 50 }}>
        <Button
          title={Strings.buttonLabels.AddNewTree}
          onPress={() => navigation.navigate(Strings.screenNames.getString('AddTree',Strings.english))}
          color={'#5DB075'}
        />
      </View>
      <View style={{ margin: 20 }}>
        <Button
          title={Strings.buttonLabels.FetchHelperData}
          onPress={fetchdata}
          color={'#5DB075'}
        />
      </View>
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

