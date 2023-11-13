import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MyIconButton } from './Components';
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
      <View style={{margin:10 }}>
        <MyIconButton
          names={["plus","tree"]}
          styles={[{opacity:0.9},{opacity:0.5}]}
          text={Strings.buttonLabels.AddNewTree}
          onPress={() => navigation.navigate(Strings.screenNames.getString('AddTree',Strings.english))}
        />
        <MyIconButton
          name={"cloud-download-alt"}
          text={Strings.buttonLabels.FetchHelperData}
          onPress={Utils.fetchAndStoreHelperData}
        />
        <MyIconButton
          name={"map-marked-alt"}
          text={Strings.buttonLabels.fetchPlotSaplingData}
          onPress={Utils.fetchAndStorePlotSaplings}
        />
      <MyIconButton
      name={"language"}
      text={Strings.buttonLabels.SelectLanguage}
      onPress={() => {
        console.log('set your language')
        setLangModalVisible(!langModalVisible)
      }}/>
      </View>
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

