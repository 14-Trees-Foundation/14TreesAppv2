import React, { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LanguageModal from './Languagemodal';
import { Strings } from './Strings';
import { SyncDisplay } from './SyncDisplay';
import { Utils } from './Utils';

// strings 
// Never 
// Last Sync Data On :
// Sync Data
// Add New Tree
// Fetch Helper Data



const HomeScreen = ({ navigation }) => {
  const [langModalVisible, setLangModalVisible] = useState(false);

  return (
    <View >
      <SyncDisplay/>
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
          onPress={Utils.fetchAndStoreHelperData}
          color={'#5DB075'}
        />
      </View>
      <View style={{ margin: 20 }}>
        <Button
          title={Strings.buttonLabels.fetchPlotSaplingData}
          onPress={Utils.fetchAndStorePlotSaplings}
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


// Utils code

