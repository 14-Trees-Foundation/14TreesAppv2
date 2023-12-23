import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
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
      Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.FailedToFetchData);
      setTimeout(() => {
        setStatus('');
      }, Constants.timeout1);
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
      const finalStatus = '';
      setStatus(finalStatus);
      setProgress(1);
      setTimeout(() => {
          setShowProgress(false);
      }, Constants.timeout1);
    }
    requestFunction(preRequest,onError,preStore,duringStore,onComplete);
  }
export const FetchDataDisplay = ({lastFetchedKey,requestFunction,iconName,buttonText})=>{
    const [lastFetchedDate,setLastFetchedDate] = useState(null);
    const [progress,setProgress] = useState(0);
    const [showProgress,setShowProgress] = useState(false);
    const [status,setStatus] = useState('');
    useFocusEffect(React.useCallback(() => {
        console.log('focusing...')
        setShowProgress(false);
        Utils.getLastFetchedDateByKey(lastFetchedKey).then((text)=>{
            let lastFetchedDateValue = '';
            if(text){
                lastFetchedDateValue +=Utils.getReadableDate(text);
            }
            else{
                lastFetchedDateValue +=Strings.messages.Never; 
            }
            setLastFetchedDate(lastFetchedDateValue);
        })
    }, []));
    const actionFunction = ()=>{
        onRequest(setStatus,setProgress,setShowProgress,requestFunction,lastFetchedKey);
    }
    useEffect(()=>{
        actionFunction();
    },[])
    return (
    <View style={{ ...commonStyles.borderedDisplay,marginHorizontal:20 }}>
    <MyIconButton
    name={iconName}
    text={buttonText}
    onPress={actionFunction}
    />
    <Text style={commonStyles.text5}>
      {Strings.messages.LastFetched + lastFetchedDate}
    </Text>
    {status.length>0 &&
      <View style={{flexDirection:'row',justifyContent:'space-around'}}>
        <Progress.CircleSnail
        size={50} color={'blue'} thickness={5} duration={700} spinDuration={2000} />
        <Text style={commonStyles.text5}>
            {status}
        </Text>
      </View>
    }
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