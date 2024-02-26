// add tree screen

import React, { useEffect, useContext } from 'react';
// import * as ImagePicker from 'react-native-image-picker';
import { TreeForm, treeFormModes } from '../components/TreeForm';
import { Constants, Utils } from '../services/Utils';
import { ToastAndroid } from 'react-native';
import { Strings } from '../services/Strings';
import LangContext from '../context/LangContext ';


const AddTreeScreen = ({ navigation, route }) => {
  const { langChanged } = useContext(LangContext);

  useEffect(() => {
    console.log("langChanged inside AddScreen: ", langChanged);
  }, [langChanged]);


  async function onVerifiedSave(tree, images) {
    await Utils.saveTreeAndImagesToLocalDB(tree, images);
    ToastAndroid.show(Strings.alertMessages.TreeSaved, ToastAndroid.SHORT);
    navigation.navigate(Strings.screenNames.getString('HomePage', Strings.english));
  }

  const inputTreeData = { ...Constants.treeFormTemplateData };

  return <TreeForm treeData={inputTreeData} updateUserId={true} updateLocation={true} onVerifiedSave={onVerifiedSave} mode={treeFormModes.addTree} />;
}

export default AddTreeScreen;