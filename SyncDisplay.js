import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View, TouchableOpacity,FlatList } from 'react-native';
import { Constants, Utils, commonStyles } from './Utils';
import { CustomButton, MyIconStack } from './Components';
import LanguageModal from './Languagemodal';
import { Strings } from './Strings';
import * as Progress from 'react-native-progress';
const updateSyncStatus = async (setSyncDate,setCounts) => {
    const l = await AsyncStorage.getItem(Constants.selectedLangKey);
    console.log('lang: ', l);
    const value = await AsyncStorage.getItem(Constants.syncDateKey);
    if (value) {
      setSyncDate(await Utils.getReadableDate(value));
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
    updateSyncStatus(setSyncDate,setTreeCounts);
    
    console.log('sync date updated')
    }, []);
    const commenceUpload = ()=>{
      showProgress(true);
      Utils.upload(setProgress).then((failures)=>{
        setFailedTrees(failures);
      });
    }
    return (
    <View style={{ ...commonStyles.borderedDisplay,margin:20 }}>
    <Text style={commonStyles.text5}>
        {Strings.languages.LastSynced} {syncDate}
    </Text>
    {
        treeCounts && <Text style={commonStyles.text5}>
        {'Synced: '} {treeCounts.uploaded} {'Pending: '} {treeCounts.pending}
        </Text>
    }
    <Button
    title={Strings.buttonLabels.SyncData}
    onPress={
        ()=>{}
    }
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