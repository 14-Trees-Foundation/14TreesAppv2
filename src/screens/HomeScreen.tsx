import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { BackHandler, ScrollView, View } from "react-native";
import { Button, Icon, ProgressBar, Surface, Text } from "react-native-paper";
import { Constants, Utils, getReadableProgress, getTimeDiffString } from "../services/Utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Strings } from "../services/Strings";
import { TreeAnalytics } from "../model/tree";
import InternetBanner from "../components/InternetInfo";
import { fetchDeltaChanges } from "../services/sync/sync";
import { Loading } from "../components/Loading";
import GlobalContext from "../context/GlobalContext ";
import Autocomplete from "../components/AutocompleteModal";
import { DaoClient } from "../services/db/dao";
import { Site } from "../model/sites";


const Home: React.FC<{ navigation: any }> = ({ navigation }) => {
  const intervalId = useRef<any>(null);
  const { langChanged } = useContext(GlobalContext);
  useEffect(() => {
    console.log('langChanged inside HomeScreen: ', langChanged);
  }, [langChanged]);

  const [lastSyncDate, setLastSyncDate] = useState('');
  const [userDetails, setUserDetails] = useState<any>(null);
  const [analytics, setAnalytics] = useState<TreeAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [sites, setSites] = useState<Site[]>([]);

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

  useFocusEffect(
    useCallback(() => {
      // Update last sync date on UI every 1 minute (60000 milliseconds)
      intervalId.current = setInterval(updateLastSyncOnUI, 60000);

      return () => {
        clearInterval(intervalId.current);
      }
    }, []),
  );

  const updateLastSyncOnUI = () => {
    if (!loading) updateLastSyncState();
  }

  const updateLastSyncState = async () => {
    const lsSate = await Utils.getLastSyncDate();
    if (lsSate) {
      setLastSyncDate(lsSate);
    }
    handleAnalytics();
  }

  const handleLastSyncDate = async () => {
    const lsSate = await Utils.getLastSyncDate();
    if (lsSate) {
      setLastSyncDate(lsSate);
    } else {
      setLoading(true);
      await fetchDeltaChanges(setProgress);
      setLoading(false);
      Utils.setLastSyncDateNow();
      updateLastSyncState();
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

      const daoClient = await DaoClient.authenticate();
      const siteId = await AsyncStorage.getItem(Constants.selectedSiteId)
      let site: Site | null = null;
      if (siteId) {
        site = await daoClient.sites.getSiteByLiveId(parseInt(siteId));
        setSelectedSite(site);
      }
      const sites = await daoClient.sites.getSites(0, 100)
      if (site) {
        const idx = sites.findIndex(value => value.id === site?.id);
        if (idx < 0) setSites([site, ...sites]);
        else setSites(sites);
      }
      else setSites(sites);
    }, 10)
  }, [])

  useEffect(() => {
    if (searchQuery.length < 1) return;
    setTimeout(async () => {
      const daoClient = await DaoClient.authenticate();
      let sites = await daoClient.sites.searchSites(searchQuery, 0, 100);
      setSites(sites);
    }, 10)
  }, [searchQuery])

  const handleSiteSelection = (site: Site | null) => {
    setSelectedSite(site);
    if (site !== null && site.id) AsyncStorage.setItem(Constants.selectedSiteId, site.id.toString());
    else AsyncStorage.removeItem(Constants.selectedSiteId);
  }

  const getName = () => {
    const name = userDetails?.name || 'User'
    return name.split(' ')[0];
  }

  const getCountValueStr = (count: number) => {
    let value = count.toString();
    if (count > 100000) {
      value = (count / 100000).toFixed(1) + 'L+';
    } else if (count > 1000) {
      value = (count / 1000).toFixed(0) + 'k+';
    }

    return value;
  }

  const card = (icon: string, title: string, value: number) => {
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
        <View style={{ marginTop: 10 }}>
          <Icon source={icon} size={50} color="#2aafdb"></Icon>
        </View>
        <Text variant='displaySmall' style={{ fontWeight: 'bold', paddingVertical: 15, color: 'black', alignItems: 'center' }}>{getCountValueStr(value)}</Text>
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
      <Loading loading={loading} text="Sync in Progress..." />
      <InternetBanner />
      <Text style={{ paddingHorizontal: 15, paddingVertical: 15, fontWeight: 'bold', alignSelf: 'flex-end' }} variant='titleLarge'>Welcome, {getName()}!</Text>
      <ScrollView>
        <View style={{ minHeight: '55%', margin: 10 }}>
          <View style={{
            flex: 1,
            flexDirection: 'row'
          }}>
            {card('chart-line', Strings.messages.TotalTrees, analytics?.total_trees_planted || 120000)}
            {card('calendar-month-outline', Strings.messages.YearTrees, analytics?.trees_planted_this_year || 0)}
          </View>
          <View style={{
            flex: 1,
            flexDirection: 'row'
          }}>
            {card('arm-flex-outline', Strings.messages.MonthTrees, analytics?.trees_planted_this_month || 0)}
            {card('account-outline', Strings.messages.PersonTrees, analytics?.trees_planted_by_you || 0)}
          </View>
        </View>
        {!loading && <View
          style={{
            padding: 15
          }}>
          <Autocomplete
            label="Select a Site"
            value={selectedSite}
            options={sites}
            keyGetter={(option) => option ? option.local_id : ''}
            valueGetter={(option) => option ? option.name_english : ''}
            onSelect={handleSiteSelection}
            onSearch={(text) => setSearchQuery(text)}
            variant='outlined'
          />
        </View>}
        <View style={{ marginVertical: 30 }}></View>
      </ScrollView>


      {loading && <View
        style={{ position: 'absolute', bottom: 80, left: 20, right: 20 }}>
        <Text style={{ textAlign: 'center', marginBottom: 5 }}>
          Fetching Data from the Server!
        </Text>
        <ProgressBar visible={loading} progress={progress} style={{ backgroundColor: '#bf8686' }} fillStyle={{ backgroundColor: '#02ab4e' }} />
        <Text style={{ textAlign: 'center', marginTop: 2 }}>Completed: {getReadableProgress(progress)}</Text>
      </View>}


      <View style={{ position: 'absolute', bottom: 10, left: 20, right: 20 }}>
        <Text variant='bodySmall' style={{ color: 'black', alignSelf: 'center', marginBottom: 4 }}>
          {Strings.messages.LastSynced} {lastSyncDate === '' ? Strings.messages.Never : getTimeDiffString(lastSyncDate)}
        </Text>
        <Button mode='elevated' style={{ backgroundColor: 'lightgreen' }} textColor="black" onPress={() => {
          navigation.navigate(
            Strings.screenNames.getString('SyncDisplay', Strings.english),
            { data: 0 },
          )
        }}>{Strings.buttonLabels.SyncData}</Button>
      </View>
    </View>
  )
}


export default Home;