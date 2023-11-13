// add tree screen

import React, { useEffect } from 'react';
// import * as ImagePicker from 'react-native-image-picker';
import { TreeForm } from './TreeForm';
import { Constants, Utils } from './Utils';
import {ToastAndroid} from 'react-native';
import { Strings } from './Strings';


const AddTreeScreen = ({ navigation }) => {
    async function onVerifiedSave(tree,images) {
      await Utils.saveTreeAndImagesToLocalDB(tree,images);
      ToastAndroid.show(Strings.alertMessages.TreeSaved, ToastAndroid.SHORT);
      navigation.navigate(Strings.screenNames.getString('HomePage',Strings.english));
    }
    const inputTreeData = {...Constants.treeFormTemplateData};
  return <TreeForm treeData={inputTreeData} updateUserId={true} updateLocation={true} onVerifiedSave={onVerifiedSave}/>;
}

export default AddTreeScreen;