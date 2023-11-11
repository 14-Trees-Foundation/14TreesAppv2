import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState,useCallback } from 'react';
import { Button, StyleSheet, Text, View, TouchableOpacity,FlatList } from 'react-native';
import { Constants, Utils, commonStyles } from './Utils';
import { CustomButton, MyIconStack } from './Components';
import LanguageModal from './Languagemodal';
import { Strings } from './Strings';
import * as Progress from 'react-native-progress';
import { useFocusEffect } from '@react-navigation/native';
const updateSyncStatus = async (setSyncDate,setCounts) => {
    const lsdate = await Utils.getLastSyncDate();
    if (lsdate) {
      setSyncDate(Utils.getReadableDate(lsdate));
    }
    else {
      setSyncDate(Strings.languages.Never);
    }
    const counts = await Utils.getSyncCounts();
    console.log('setting counts: ', counts);
    setCounts(counts);
  }
export const getReadableProgress = (progress)=>{
  return Math.round(progress*100).toString()+'%';
}
export const SyncDisplay = (props)=>{
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
        }, 2000);
      });
    }
    return (
    <View style={{ ...commonStyles.borderedDisplay,margin:20 }}>
    <Text style={commonStyles.text5}>
        {Strings.languages.LastSynced} {syncDate}
    </Text>
    {
        treeCounts &&
        <View style={{flexDirection:'row',justifyContent:'space-around',margin:3}}>
          <Text style={commonStyles.text5}>
            {'Pending: '} {treeCounts.pending}
          </Text>
          <Text style={commonStyles.text5}>{treeCounts.pending>0 ? '❗' :'✅'}</Text>
          <Text style={commonStyles.text5}>
            {'Synced: '} {treeCounts.uploaded}
          </Text>
        </View>
    }
    <Button
    title={Strings.buttonLabels.SyncData}
    onPress={commenceUpload}
    color={'#5DB075'}
    />
      {
        showProgress &&
        <View style={{flexDirection:'row',justifyContent:'space-around',margin:5,alignItems:'center'}}>
        <Text style={commonStyles.text5}>Progress: </Text>
        <Progress.Bar progress={progress} style={{height:6}} />
        <Text style={commonStyles.text5}>{getReadableProgress(progress)}</Text>
      </View>
      }
    {
      (failedTrees.length>0) && 
      <FlatList
        ListHeaderComponent={()=><Text style={commonStyles.text5}>Failed to upload {failedTrees.length} trees: </Text>}
        data={failedTrees}
        renderItem={(item,index)=>{
          return <Text style={commonStyles.text5}>{index+1}. {item.sapling_id}</Text>
        }}
      />
    }
    </View>
    );
}