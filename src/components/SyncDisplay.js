import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import * as Progress from 'react-native-progress';
import { Strings } from '../services/Strings';
import { Constants, Utils, commonStyles } from '../services/Utils';
import { MyIconButton } from './Components';
const updateSyncStatus = async (setSyncDate,setCounts) => {
    const lsdate = await Utils.getLastSyncDate();
    if (lsdate) {
      setSyncDate(Utils.getReadableDate(lsdate));
    }
    else {
      setSyncDate(Strings.messages.Never);
    }
    const counts = await Utils.getSyncCounts();
    console.log('setting counts: ', counts);
    setCounts(counts);
  }
export const getReadableProgress = (progress)=>{
  return Math.round(progress*100).toString()+'%';
}
export const SyncDisplay = ({onSyncComplete})=>{
    const [syncDate, setSyncDate] = useState('');
    const [treeCounts,setTreeCounts] = useState(null);
    const [progress,setProgress] = useState(0);
    const [showProgress,setShowProgress] = useState(false);
    const [failedTrees,setFailedTrees] = useState([]);
    useEffect(() => {

    }, []);
    useFocusEffect(useCallback(()=>{
      updateSyncStatus(setSyncDate,setTreeCounts);
      console.log('sync date updated')
    },[]))
    const commenceUpload = ()=>{
      setShowProgress(true);
      Utils.upload(setProgress).then(async(failures)=>{
        setFailedTrees(failures);
        setProgress(1);
        updateSyncStatus(setSyncDate,setTreeCounts);
        setTimeout(() => {
          setShowProgress(false);
        }, Constants.timeout1);
        if(onSyncComplete){
          onSyncComplete();
        }
      });
    }
    return (
    <View style={{ ...commonStyles.borderedDisplay,marginHorizontal:20,marginTop:20}}>
    <Text style={commonStyles.text5}>
        {Strings.messages.LastSynced} {syncDate}
    </Text>
    {
        treeCounts &&
        <View style={{flexDirection:'row',justifyContent:'space-around',margin:3}}>
          <Text style={commonStyles.text5}>
            {Strings.messages.pending}: {treeCounts.pending}
          </Text>
          <Text style={commonStyles.text5}>{treeCounts.pending>0 ? '❗' :'✅'}</Text>
          <Text style={commonStyles.text5}>
            {Strings.messages.synced}: {treeCounts.uploaded}
          </Text>
        </View>
    }
    <MyIconButton
    name={"wifi-sync"}
    text={Strings.buttonLabels.SyncData}
    onPress={commenceUpload}
    />
      {
        showProgress &&
        <View style={{flexDirection:'row',justifyContent:'space-around',margin:5,alignItems:'center'}}>
        <Text style={commonStyles.text5}>{Strings.messages.progress}: </Text>
        <Progress.Bar progress={progress} style={{height:6}} />
        <Text style={commonStyles.text5}>{getReadableProgress(progress)}</Text>
      </View>
      }
    {
      (failedTrees.length>0) && 
      <FlatList
        ListHeaderComponent={()=><Text style={commonStyles.text5}>{Strings.messages.failedToUpload} {failedTrees.length} {Strings.messages.trees}: </Text>}
        data={failedTrees}
        renderItem={({item,index})=>{
          return <Text style={commonStyles.text5}>{index+1}. {Strings.messages.SaplingNo} {item.sapling_id}</Text>
        }}
      />
    }
    </View>
    );
}