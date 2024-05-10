import React, {useEffect, useState, useContext, useCallback} from 'react';
import {View, BackHandler, Alert} from 'react-native';
import {MyIconButton} from '../components/Components';
import LanguageModal from '../components/Languagemodal';
import {Strings} from '../services/Strings';
import {SyncDisplay} from '../components/SyncDisplay';
import {Utils} from '../services/Utils';
import LangContext from '../context/LangContext ';
import {useFocusEffect} from '@react-navigation/native';

import {trees, RealmContext, plots, tree_types} from '../models/Tree';
const {useQuery, useRealm} = RealmContext;


//const {useRealm} = RealmContext;
const realm = useRealm();


const HomeScreen = ({navigation}) => {
  const [langModalVisible, setLangModalVisible] = useState(false);

  const {langChanged, setTreesInRealm} = useContext(LangContext);

  const atlastreesArray = useQuery(trees)
  // const atlastreesArray = useQuery(trees, collection =>
  //   collection.filtered('sapling_id == "647783"'));
  const atlasPlotsArray = useQuery(plots);
  const atlasTreeTypesArray = useQuery(tree_types);
  const atlastrees = atlastreesArray.map(doc => ({
    sapling_id: doc.sapling_id,
  }));
  const atlasPlots = atlasPlotsArray.map(doc => ({
    name: doc.name,
    plot_id: doc.plot_id,
    _id: doc._id,
  }));
  const atlasTreeTypes = atlasTreeTypesArray.map(doc => ({
    name: doc.name,
    tree_id: doc.tree_id,
    _id: doc._id,
  }));

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        console.log('exiting from homescreen-----');

        BackHandler.exitApp();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }, []),
  );

   // //realm
  useEffect(() => {
    console.log('---------------subscribed to update trees-in Home---------');
    try{
    realm.subscriptions.update(mutableSubs => {
      mutableSubs.add(realm.objects(trees))
    });
    realm.subscriptions.update(mutableSubs => {
      mutableSubs.add(realm.objects(plots));
    });
    realm.subscriptions.update(mutableSubs => {
      mutableSubs.add(realm.objects(tree_types));
    });
  }catch(error){
    console.log("---error while subscribiing to updates---",error)
  }
  }, [realm]);
  
  
  useEffect(() => {
    setTreesInRealm(atlastreesArray);
  },[]);

  useEffect(() => {
    console.log('langChanged inside HomeScreen: ', langChanged);
  }, [langChanged]);

  useEffect(() => {
    console.log('---in useEffect--- Home---');
    Utils.fetchAndStoreHelperData(atlastrees, atlasPlots, atlasTreeTypes);
  }, []);

  return (
    <View>
      <SyncDisplay />
      <View style={{margin: 10}}>
        <MyIconButton
          names={['plus', 'tree']}
          styles={[{opacity: 0.9}, {opacity: 0.5}]}
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
          onPress={Utils.fetchAndStoreHelperData(
            atlastrees,
            atlasPlots,
            atlasTreeTypes,
          )}
        />
        <View style={{alignItems: 'center'}}>
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
