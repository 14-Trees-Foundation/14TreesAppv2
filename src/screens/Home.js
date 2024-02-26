import React, { useEffect, useState, useContext } from 'react';
import { View } from 'react-native';
import { MyIconButton } from '../components/Components';
import LanguageModal from '../components/Languagemodal';
import { Strings } from '../services/Strings';
import { SyncDisplay } from '../components/SyncDisplay';
import { Utils } from '../services/Utils';
import LangContext from '../context/LangContext ';

const HomeScreen = ({ navigation }) => {
  const [langModalVisible, setLangModalVisible] = useState(false);

  const { langChanged } = useContext(LangContext);

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
