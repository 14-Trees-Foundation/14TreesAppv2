// add tree screen

import React, { useEffect } from 'react';
// import * as ImagePicker from 'react-native-image-picker';
import { TreeForm } from './TreeForm';
import { Constants, Utils } from './Utils';
import {ToastAndroid} from 'react-native';
import { Strings } from './Strings';


const AddTreeScreen = ({ navigation }) => {
    let ldb;
    useEffect(React.useCallback(()=>{
      Utils.setDBConnection().then((dbobj)=>{
        ldb = dbobj;
      })
    }));
    async function onVerifiedSave(tree,images) {
      await ldb.saveTrees(tree, 0);
      for (let index = 0; index < images.length; index++) {
        const element = {
          saplingid: images[index].saplingid,
          image: images[index].data,
          imageid: images[index].name,
          remark: images[index].meta.remark,
          timestamp: images[index].meta.capturetimestamp,
        };
        await ldb.saveTreeImages(element);
      }
      ToastAndroid.show(Strings.alertMessages.TreeSaved, ToastAndroid.SHORT);
      navigation.navigate(Strings.screenNames.getString('HomePage',Strings.english));
    }
    const inputTreeData = {...Constants.treeFormTemplateData};
  return <TreeForm treeData={inputTreeData} updateUserId={true} updateLocation={true} onVerifiedSave={onVerifiedSave}/>;
}

export default AddTreeScreen;