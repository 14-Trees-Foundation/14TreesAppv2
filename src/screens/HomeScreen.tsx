import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, ScrollView, View } from "react-native";
import { Button, Icon, Surface, Text } from "react-native-paper";
import { Constants, Utils, getTimeDiffString } from "../services/Utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Strings } from "../services/Strings";
import { TreeAnalytics } from "../model/tree";
import InternetBanner from "../components/InternetInfo";
import { fetchDeltaChanges } from "../services/sync/sync";
import { Loading } from "../components/Loading";


const Home: React.FC<{navigation: any}> = ({ navigation }) => {
  const [lastSyncDate, setLastSyncDate] = useState('');
  const [userDetails, setUserDetails] = useState<any>(null);
  const [analytics, setAnalytics] = useState<TreeAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        BackHandler.exitApp();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }, []),
  );

  const handleLastSyncDate = async () => {
    const lsSate = await Utils.getLastSyncDate();
    if (lsSate) {
      setLastSyncDate(lsSate);
    } else {
      setLoading(true);
      await fetchDeltaChanges(setProgress);
      setLoading(false);
      Utils.setLastSyncDateNow();
    }
  }
  const handleAnalytics = async () => {
    const data = await AsyncStorage.getItem(Constants.treeAnalyticsDataKey);
    if (data) {
        const analytics: TreeAnalytics = JSON.parse(data);
        setAnalytics(analytics);
      }
  }

  useFocusEffect(
      useCallback(() => {
        handleLastSyncDate();
        handleAnalytics();
        return () => {
        };
      }, [])
  );

  useEffect(() => {
    setTimeout(async () => {
        const userData = await AsyncStorage.getItem(Constants.userDetailsKey)
        if (userData) setUserDetails(JSON.parse(userData));
    })
  }, [])

  const getName = () => {
    const name = userDetails?.name || 'User'
    return name.split(' ')[0];
  }

  const card = (icon: string, title: string, value: number) => {
    if (value > 10) value = Math.floor(value/10) * 10;
    return (
      <Surface
        style={{
          width: '45%',
          margin: 5,
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
          flexGrow: 1,
        }}
        elevation={3}
      >
        <View style={{marginTop: 10}}>
          <Icon source={icon} size={50} color="#2aafdb"></Icon>
        </View>
        <Text variant='displaySmall' style={{ fontWeight: 'bold', paddingVertical: 15, color: 'black', alignItems: 'center' }}>{value + '+'}</Text>
        <Text 
          variant='titleMedium' 
          style={{
            color: 'black', 
            paddingHorizontal: 15,
            marginVertical: 3,
            textAlign: 'center'
          }} 
          textBreakStrategy='highQuality'
          numberOfLines={2}
        >
          {title}
        </Text>
      </Surface>
    )
  }

  return (
    <View style={{ height: '97%' }}>
      <Loading loading={loading} text="Fetching data from server. Please wait a while."/>
      <InternetBanner />
      <Text style={{ paddingHorizontal: 15, paddingVertical: 15, fontWeight: 'bold', alignSelf: 'flex-end' }} variant='titleLarge'>Welcome, {getName()}!</Text>
      <ScrollView>
        <View style={{ minHeight: '55%', margin: 10 }}>
          <View style={{
            flex: 1,
            flexDirection: 'row'
          }}>
            {card('chart-line', ' Total Trees Planted Till Date', analytics?.total_trees_planted || 120000)}
            {card('calendar-month-outline', 'Trees Planted This Year', analytics?.trees_planted_this_year || 0)}
          </View>
          <View style={{
            flex: 1,
            flexDirection: 'row'
          }}>
            {card('arm-flex-outline', 'Trees Planted This Month', analytics?.trees_planted_this_month || 0)}
            {card('account-outline', 'Trees Planted By You!', analytics?.trees_planted_by_you || 0)}
          </View>
        </View>
        <View style={{ marginVertical: 30 }}></View>
      </ScrollView>


      <View style={{ position: 'absolute', bottom: 10, left: 20, right: 20 }}>
        <Text variant='bodySmall' style={{ color: 'black', alignSelf: 'center', marginBottom: 4 }}>
          Last Synced: {lastSyncDate === '' ? 'Never' : getTimeDiffString(lastSyncDate)}
        </Text>
        <Button mode='elevated' style={{ backgroundColor: 'lightgreen' }} textColor="black"  onPress={() => {
          navigation.navigate(
            Strings.screenNames.getString('SyncDisplay', Strings.english),
            { data: 0 },
          )
        }}>Sync</Button>
      </View>
    </View>
  )
}


export default Home;