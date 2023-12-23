import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import * as Progress from 'react-native-progress';
import { Strings } from '../services/Strings';
import { Constants, Utils, commonStyles } from '../services/Utils';
import { MyIconButton } from './Components';
const updateSyncStatus = async (setSyncDate) => {
    const lsdate = await Utils.getLastSyncDate();
    if (lsdate) {
      setSyncDate(Utils.getReadableDate(lsdate));
    }
    else {
      setSyncDate(Strings.messages.Never);
    }
  }
export const getReadableProgress = (progress)=>{
  return Math.round(progress*100).toString()+'%';
}
const onRequest = (setStatus,setProgress,setShowProgress,requestFunction,lastFetchedKey)=>{
    const preRequest = ()=>{
      setShowProgress(false);
      setStatus(Strings.messages.fetching);
    }
    const onError = ()=>{
      setStatus(Strings.messages.failed);
    }
    const preStore = ()=>{
      setStatus(Strings.messages.storing);
      setProgress(0);
      setShowProgress(true);
    }
    const duringStore = (progress)=>{
      setProgress(progress);
    }
    const onComplete = async()=>{
      await Utils.setLastFetchedDateNowByKey(lastFetchedKey);
      const nowString = await Utils.getLastFetchedDateByKey(lastFetchedKey);
      const finalStatus = Strings.messages.LastFetched+Utils.getReadableDate(nowString);
      setStatus(finalStatus);
      setProgress(1);
      setTimeout(() => {
          setShowProgress(false);
      }, Constants.timeout1);
    }
    requestFunction(preRequest,onError,preStore,duringStore,onComplete);
  }
export const FetchDataDisplay = ({lastFetchedKey,requestFunction,iconName,buttonText})=>{
    const [syncDate, setSyncDate] = useState('');
    const [progress,setProgress] = useState(0);
    const [showProgress,setShowProgress] = useState(false);
    const [status,setStatus] = useState('');
    useFocusEffect(React.useCallback(() => {
        console.log('focusing...')
        setShowProgress(false);
        Utils.getLastFetchedDateByKey(lastFetchedKey).then((text)=>{
            let status = Strings.messages.LastFetched;
            if(text){
                status +=Utils.getReadableDate(text);
            }
            else{
                status +=Strings.messages.Never; 
            }
            setStatus(status);
        })
    }, []));
    const actionFunction = ()=>{
        onRequest(setStatus,setProgress,setShowProgress,requestFunction,lastFetchedKey);
    }
    useEffect(()=>{
        actionFunction();
    },[])
    return (
    <View style={{ ...commonStyles.borderedDisplay,margin:20 }}>
    <Text style={commonStyles.text5}>
        {status}
    </Text>
    <MyIconButton
    name={iconName}
    text={buttonText}
    onPress={actionFunction}
    />
      {
        showProgress &&
        <View style={{flexDirection:'row',justifyContent:'space-around',margin:5,alignItems:'center'}}>
        <Text style={commonStyles.text5}>{Strings.messages.progress}: </Text>
        <Progress.Bar progress={progress} style={{height:6}} />
        <Text style={commonStyles.text5}>{getReadableProgress(progress)}</Text>
      </View>
      }
    </View>
    );
}