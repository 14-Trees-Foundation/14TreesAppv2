import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
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

export const SyncDisplay = (props)=>{
    const [syncDate, setSyncDate] = useState('');
    const [treeCounts,setTreeCounts] = useState(null);
    useEffect(() => {
    updateSyncStatus(setSyncDate,setTreeCounts);

    console.log('sync date updated')
    }, []);
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
        async()=>console.log(await Utils.getReadableDate(syncDate))
    }
    color={'#5DB075'}
    />
    </View>
    );
}