import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, BackHandler, Alert } from 'react-native';
import { MyIconButton } from '../components/Components';
import LanguageModal from '../components/Languagemodal';
import { Strings } from '../services/Strings';
import { SyncDisplay } from '../components/SyncDisplay';
import { Utils } from '../services/Utils';
import LangContext from '../context/LangContext ';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  const [langModalVisible, setLangModalVisible] = useState(false);

  const { langChanged } = useContext(LangContext);



  useFocusEffect(useCallback(() => {
    const backAction = () => {
      console.log("exiting from homescreen-----");

      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []))

  useEffect(() => {
    console.log("langChanged inside HomeScreen: ", langChanged);
  }, [langChanged]);

  useEffect(() => {
    Utils.fetchAndStoreHelperData();
  }, []);


  return (
    <View>
      <SyncDisplay />
      <View style={{ margin: 10 }}>
        <MyIconButton
          names={['plus', 'tree']}
          styles={[{ opacity: 0.9 }, { opacity: 0.5 }]}
          text={Strings.buttonLabels.AddNewTree}
          onPress={() =>
            navigation.navigate(
              Strings.screenNames.getString('AddTree', Strings.english),
            )
          }
        />
        <MyIconButton
          name={'cloud-download-alt'}
          text={Strings.buttonLabels.FetchHelperData}
          onPress={Utils.fetchAndStoreHelperData}
        />
        <View style={{ alignItems: 'center' }}>
          <MyIconButton
            name={'language'}
            text={Strings.buttonLabels.SelectLanguage}
            onPress={() => {
              console.log('set your language');
              setLangModalVisible(!langModalVisible);
            }}
          />
        </View>
      </View>
      <LanguageModal
        langModalVisible={langModalVisible}
        setLangModalVisible={setLangModalVisible}

      />
    </View>
  );
};

export default HomeScreen;
