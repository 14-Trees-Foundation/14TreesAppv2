import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { BackHandler, ScrollView, View } from "react-native";
import { Button, Icon, IconButton, ProgressBar, Surface, Text } from "react-native-paper";
import { Constants, Utils, getTimeDiffString } from "../services/Utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Strings } from "../services/Strings";
import { TreeAnalytics } from "../model/tree";
import InternetBanner from "../components/InternetInfo";
import GlobalContext from "../context/GlobalContext ";
import Autocomplete from "../components/AutocompleteModal";
import { LocationSite } from "../model/sites";
import { ApiClient } from "../services/api/api";
import { DaoClient } from "../services/db/dao";
import { fetchAndStoreLocationSites } from "../services/sync/location_sites";


const Home: React.FC<{ navigation: any }> = ({ navigation }) => {
  const intervalId = useRef<any>(null);
  const { langChanged } = useContext(GlobalContext);
  useEffect(() => {
    console.log('langChanged inside HomeScreen: ', langChanged);
  }, [langChanged]);

  const apiClient = new ApiClient();
  const [lastSyncDate, setLastSyncDate] = useState('');
  const [userDetails, setUserDetails] = useState<any>(null);
  const [analytics, setAnalytics] = useState<TreeAnalytics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSite, setSelectedSite] = useState<LocationSite | null>(null);
  const [sites, setSites] = useState<LocationSite[]>([]);
  const [sitesLoading, setSitesLoading] = useState(false);

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
      intervalId.current = setInterval(updateLastSyncOnUI, 60000);

      return () => {
        clearInterval(intervalId.current);
      }
    }, []),
  );

  const updateLastSyncOnUI = () => {
    updateLastSyncState();
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
    }
  }

  const handleAnalytics = async (user?: any) => {
    const resolvedUser = user ?? userDetails;
    const data = await AsyncStorage.getItem(Constants.treeAnalyticsDataKey);
    if (data) {
      const analytics: TreeAnalytics = JSON.parse(data);
      setAnalytics(analytics);
    } else if (resolvedUser) {
      const analytics = await apiClient.trees.analyticsCount(resolvedUser.name);
      setAnalytics(analytics)
      await AsyncStorage.setItem(Constants.treeAnalyticsDataKey, JSON.stringify(analytics))
      updateLastSyncOnUI();
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

  // Load sites from local SQLite cache on mount
  const loadSitesFromLocal = async () => {
    const daoClient = await DaoClient.authenticate();
    const localSites = await daoClient.locationSites.getLocationSites(0, -1);
    setSites(localSites);
  };

  useEffect(() => {
    const fetchData = async () => {
      let user = null;
      const userData = await AsyncStorage.getItem(Constants.userDetailsKey)
      if (userData) {
        user = JSON.parse(userData);
        setUserDetails(user);
      }

      const data = await AsyncStorage.getItem(Constants.selectedSite)
      if (data) {
        const raw = JSON.parse(data);
        const site: LocationSite = { ...raw, location_name: raw.location_name ?? raw.name_english ?? '' };
        setSelectedSite(site);
      }

      await loadSitesFromLocal();
      await handleAnalytics(user);
    }

    fetchData();
  }, []);

  // Refresh sites from network, then reload local cache
  const handleRefreshSites = async () => {
    setSitesLoading(true);
    try {
      await fetchAndStoreLocationSites();
      await loadSitesFromLocal();
    } finally {
      setSitesLoading(false);
    }
  };

  const handleSiteSelection = (site: LocationSite | null) => {
    setSelectedSite(site);
    if (site !== null) AsyncStorage.setItem(Constants.selectedSite, JSON.stringify(site))
    else AsyncStorage.removeItem(Constants.selectedSite);
  }

  // Filter sites locally from cached list
  const filteredSites = searchQuery.length >= 1
    ? sites.filter(s => s.location_name.toLowerCase().includes(searchQuery.toLowerCase()))
    : sites;

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
      <InternetBanner />
      <Text style={{ paddingHorizontal: 15, paddingVertical: 15, fontWeight: 'bold', alignSelf: 'flex-end' }} variant='titleLarge'>Welcome, {getName()}!</Text>
      <ScrollView>
        {analytics !== null && <View style={{ minHeight: '55%', margin: 10 }}>
          <View style={{
            flex: 1,
            flexDirection: 'row'
          }}>
            {card('chart-line', Strings.messages.TotalTrees, analytics.total_trees_planted)}
            {card('calendar-month-outline', Strings.messages.YearTrees, analytics.trees_planted_this_year)}
          </View>
          <View style={{
            flex: 1,
            flexDirection: 'row'
          }}>
            {card('arm-flex-outline', Strings.messages.MonthTrees, analytics.trees_planted_this_month)}
            {card('account-outline', Strings.messages.PersonTrees, analytics.trees_planted_by_you)}
          </View>
        </View>}
        {<View style={{ padding: 15 }}>
          <Text variant='bodyMedium'>{Strings.messages.SelectTheSiteYouAreAt}:</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Autocomplete
                label={selectedSite ? Strings.labels.SelectedSite : Strings.labels.ClickSiteFromDropdown}
                value={selectedSite}
                options={filteredSites}
                keyGetter={(option) => option ? option.id : ''}
                valueGetter={(option) => option.location_name}
                onSelect={handleSiteSelection}
                onSearch={(text) => { setSearchQuery(text); }}
                variant='outlined'
                helpedText={Strings.messages.SelectTheSiteYouAreAt}
              />
            </View>
            <IconButton
              icon="refresh"
              size={26}
              disabled={sitesLoading}
              onPress={handleRefreshSites}
              style={{ marginLeft: 2 }}
            />
          </View>
          {sitesLoading && (
            <ProgressBar indeterminate style={{ marginTop: 4, borderRadius: 2 }} color="#2aafdb" />
          )}
        </View>}
        <View style={{ marginVertical: 30 }}></View>
      </ScrollView>

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
