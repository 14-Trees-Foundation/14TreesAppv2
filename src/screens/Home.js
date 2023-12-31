import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MyIconButton } from '../components/Components';
import LanguageModal from '../components/Languagemodal';
import { Strings } from '../services/Strings';
import { SyncDisplay } from '../components/SyncDisplay';
import { Constants, LOGTYPES, Utils } from '../services/Utils';
import { FetchDataDisplay } from '../components/FetchDataDisplay';
import { DataService } from '../services/DataService';

const HomeScreen = ({ navigation }) => {
  const [langModalVisible, setLangModalVisible] = useState(false);
  return (
    <View >
      <SyncDisplay/>
      <FetchDataDisplay
        iconName={"cloud-download-alt"}
        buttonText={Strings.buttonLabels.FetchHelperData}
        requestFunction={Utils.fetchAndStoreHelperData}
        lastFetchedKey={Constants.helperDataLastFetchedKey}
      />
      {/* Comment out the button below until we have "representative" saplings that are fetched instead of all the saplings. See notion/talk to Chaitanya about this. */}
      {/* <FetchDataDisplay
        iconName={"map-marked-alt"}
        buttonText={Strings.buttonLabels.fetchPlotSaplingData}
        requestFunction={Utils.fetchAndStorePlotSaplings}
        lastFetchedKey={Constants.plotSaplingDataLastFetchedKey}
      /> */}
      <View style={{margin:10 }}>
      <MyIconButton
          names={["plus","tree"]}
          styles={[{opacity:0.9},{opacity:0.5}]}
          text={Strings.buttonLabels.AddNewTree}
          onPress={
            () => navigation.navigate(Strings.screenNames.getString('AddTree',Strings.english))
          }
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

