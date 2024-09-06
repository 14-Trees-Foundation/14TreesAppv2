import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { BackHandler, ScrollView, View } from "react-native";
import { Button, Icon, ProgressBar, Surface, Text } from "react-native-paper";
import { Constants, Utils, getReadableProgress, getTimeDiffString } from "../services/Utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Strings } from "../services/Strings";
import { TreeAnalytics } from "../model/tree";
import InternetBanner from "../components/InternetInfo";
import GlobalContext from "../context/GlobalContext ";
import Autocomplete from "../components/AutocompleteModal";
import { Site } from "../model/sites";
import { ApiClient } from "../services/api/api";


const Home: React.FC<{ navigation: any }> = ({ navigation }) => {
  const intervalId = useRef<any>(null);
  const { langChanged, downloadInProgress, setDownloadInProgress, syncProgress, setSyncProgress } = useContext(GlobalContext);
  useEffect(() => {
    console.log('langChanged inside HomeScreen: ', langChanged);
  }, [langChanged]);

  const apiClient = new ApiClient();
  const [lastSyncDate, setLastSyncDate] = useState('');
  const [userDetails, setUserDetails] = useState<any>(null);
  const [analytics, setAnalytics] = useState<TreeAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
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
    } 
    // else {
    //   setLoading(true);
    //   setDownloadInProgress(true);
    //   await fetchDeltaChanges(setSyncProgress);
    //   setLoading(false);
    //   setDownloadInProgress(false);
    //   Utils.setLastSyncDateNow();
    //   updateLastSyncState();
    // }
  }
  const handleAnalytics = async () => {
    const data = await AsyncStorage.getItem(Constants.treeAnalyticsDataKey);
    if (data) {
      const analytics: TreeAnalytics = JSON.parse(data);
      setAnalytics(analytics);
    } else if (userDetails) {
      const analytics = await apiClient.trees.analyticsCount(userDetails.name);
      console.log(analytics);
      setAnalytics(analytics)
      await AsyncStorage.setItem(Constants.treeAnalyticsDataKey, JSON.stringify(analytics))
    }
  }

  const handleDownloadInProgress = async () => {
    // check if is it first sync
    const lsSate = await Utils.getLastSyncDate();
    if (lsSate) {
      // if not avoid showing progress bar on home screen
      setLastSyncDate(lsSate);
    } else {
      setLoading(true);
    }
  }

  useFocusEffect(
    useCallback(() => {
      // if (downloadInProgress) {
      //   handleDownloadInProgress();
      // } else {
      // }
      handleLastSyncDate();
      handleAnalytics();
      return () => {
      };
    }, [])
  );

  useEffect(() => {
    const fetchData = async () => {
      const userData = await AsyncStorage.getItem(Constants.userDetailsKey)
      if (userData) setUserDetails(JSON.parse(userData));

      const data = await AsyncStorage.getItem(Constants.selectedSite)
      if (data) {
        const site: Site = JSON.parse(data);
        setSelectedSite(site);
      }

      if (searchQuery.length === 0) {
        const sites = await apiClient.sites.getSites(0, 20)
        setSites(sites.results);
      }
    }

    fetchData();
  }, [searchQuery])

  useEffect(() => {
    if (searchQuery.length < 3) return;
    const searchSites = async () => {
      let sites = await apiClient.sites.getSites(0, 20, [{ columnField: 'name_english', value: searchQuery, operatorValue: 'contains' }]);
      setSites(sites.results);
    }

    searchSites();
  }, [searchQuery])

  const handleSiteSelection = (site: Site | null) => {
    setSelectedSite(site);
    if (site !== null) AsyncStorage.setItem(Constants.selectedSite, JSON.stringify(site))
    else AsyncStorage.removeItem(Constants.selectedSite);
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
        {<View
          style={{
            padding: 15
          }}>
          <Text variant='bodyMedium'>{Strings.messages.SelectTheSiteYouAreAt}:</Text>
          <Autocomplete
            label={selectedSite ? Strings.labels.SelectedSite : Strings.labels.ClickSiteFromDropdown}
            value={selectedSite}
            options={sites}
            keyGetter={(option) => option ? option.id : ''}
            valueGetter={(option) => {
              return option.plot_count && option.plot_count > 0
                ? `${option.name_english} (Plots: ${option.plot_count})`
                : option.name_english
            }}
            onSelect={handleSiteSelection}
            onSearch={(text) => setSearchQuery(text)}
            variant='outlined'
            helpedText={Strings.messages.SelectTheSiteYouAreAt}
          />
        </View>}
        <View style={{ marginVertical: 30 }}></View>
      </ScrollView>

      {loading && <View
        style={{ position: 'absolute', bottom: 80, left: 20, right: 20 }}>
        <Text style={{ textAlign: 'center', marginBottom: 5 }}>
          Fetching Data from the Server!
        </Text>
        <ProgressBar visible={loading} progress={syncProgress} style={{ backgroundColor: '#bf8686' }} fillStyle={{ backgroundColor: '#02ab4e' }} />
        <Text style={{ textAlign: 'center', marginTop: 2 }}>Completed: {getReadableProgress(syncProgress)}</Text>
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