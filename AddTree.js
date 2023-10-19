// add tree screen

import React, { useEffect } from 'react';
// import * as ImagePicker from 'react-native-image-picker';
import { TreeForm } from './TreeForm';
import { Utils } from './Utils';



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
          timestamp: images[index].meta.captureTimestamp,
        };
        await ldb.saveTreeImages(element);
      }
    }
    const inputTreeData = {inSaplingId:null,inLat:0,inLng:0,inImages:[],inPlot:{},inTreeType:{},inUserId:''};
  return <TreeForm treeData={inputTreeData} updateUserId={true} onVerifiedSave={onVerifiedSave} navigation={navigation}/>;
}

export default AddTreeScreen;