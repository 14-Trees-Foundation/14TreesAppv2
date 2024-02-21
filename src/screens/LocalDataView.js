//TODO bug fix in filters.
import React, {useEffect, useState} from 'react';
import {
  Button,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
// import * as ImagePicker from 'react-native-image-picker';
import {useFocusEffect} from '@react-navigation/native';
import {CustomButton, MyIconButton} from '../components/Components';
import {CustomDropdown} from '../components/CustomDropdown';
import {Strings} from '../services/Strings';
import {Utils} from '../services/Utils';
import {SyncDisplay} from '../components/SyncDisplay';
import {commonStyles} from '../services/Styles';

const LocalDataView = ({navigation}) => {
  const [treeList, setTreeList] = useState(null);
  const [finalList, setFinalList] = useState(null);
  const [treeTypeList, setTreeTypeList] = useState([]);
  const [plotList, setPlotList] = useState([]);
  const [saplingIdList, setsaplingIdList] = useState([]);
  const [uploadStatusList, setUploadStatusList] = useState([]);
  const [userId, setUserId] = useState('');
  const [selectedTreeType, setSelectedTreeType] = useState({});
  const [selectedPlot, setSelectedPlot] = useState({});
  const [selectedSaplingId, setSelectedSaplingId] = useState({});
  const [allPlots, setAllPlots] = useState([]);
  const [allTreeTypes, setAllTreeTypes] = useState([]);
  const [allSaplings, setAllSaplings] = useState([]);
  const uploadStatuses = [
    {name: Strings.messages.LocalOrSynced, value: 0},
    {name: Strings.messages.Local, value: 1},
    {name: Strings.messages.synced, value: 2},
  ];
  const [selectedUploadStatus, setSelectedUploadStatus] = useState(
    uploadStatuses[0],
  );

  const fetchTreesFromLocalDB = () => {
    Utils.fetchTreesFromLocalDB().then(trees => {
      // console.log(trees)
      const syncedTrees = trees.filter(tree => tree.uploaded === true);
      const localTrees = trees.filter(tree => tree.uploaded !== true);
      trees = [...localTrees, ...syncedTrees];
      setTreeList(trees);
      setFinalList(trees);
      console.log('setting both lists to: ', trees);
    });
  };
  useEffect(() => {
    setUploadStatusList(uploadStatuses);
    Utils.getUserId().then(id => {
      setUserId(id);
    });
    // // loadDataCallback();
    Utils.getLocalTreeTypesAndPlots().then(response => {
      setAllTreeTypes(response.treeTypes);
      setAllPlots(response.plots);
    });

    Utils.fetchTreeTypesFromLocalDB().then(types => {
      console.log('tree types', types);
      setTreeTypeList(types);
    });
    Utils.fetchPlotNamesFromLocalDB().then(plots => {
      setPlotList(plots);
    });
    Utils.fetchSaplingIdsFromLocalDB().then(ids => {
      console.log(ids);
      setsaplingIdList(ids);
    });
    console.log('local data view');
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      fetchTreesFromLocalDB();
      console.log('focus');
    }, []),
  );
  const typeNameFromId = id => {
    return allTreeTypes.find(type => type.value === id).name;
  };
  const plotNameFromId = id => {
    return allPlots.find(type => type.value === id).name;
  };
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const applychanges = () => {
    let tempfinalList = [];
    console.log(selectedTreeType);
    console.log(selectedPlot);
    console.log(selectedSaplingId);
    // how to check whether the selectedSaplingId is null or not
    tempfinalList = treeList;
    if (Object.keys(selectedSaplingId).length !== 0) {
      console.log('sapling id selected');
      tempfinalList = tempfinalList.filter(
        tree => tree.sapling_id === selectedSaplingId.name,
      );
    }
    if (
      Object.keys(selectedPlot).length === 0 &&
      Object.keys(selectedTreeType).length !== 0
    ) {
      console.log('only tree type selected');
      tempfinalList = tempfinalList.filter(
        tree => tree.type_id === selectedTreeType.value,
      );
    }
    if (
      Object.keys(selectedPlot).length !== 0 &&
      Object.keys(selectedTreeType).length === 0
    ) {
      console.log('only plot selected');
      tempfinalList = tempfinalList.filter(
        tree => tree.plot_id === selectedPlot.value,
      );
    }
    if (
      Object.keys(selectedPlot).length !== 0 &&
      Object.keys(selectedTreeType).length !== 0
    ) {
      console.log('both plot and tree type selected');
      tempfinalList = tempfinalList.filter(
        tree =>
          tree.plot_id === selectedPlot.value &&
          tree.type_id === selectedTreeType.value,
      );
    }
    if (selectedUploadStatus.value !== uploadStatuses[0].value) {
      //Not 'local or synced'
      const wantUploaded =
        selectedUploadStatus.value === uploadStatuses[2].value; //'Synced'
      console.log(selectedUploadStatus, uploadStatuses[2]);
      console.log(wantUploaded);
      console.log(tempfinalList);
      tempfinalList = tempfinalList.filter(
        tree => tree.uploaded === wantUploaded,
      );
    }
    if (tempfinalList.length === 0) {
      ToastAndroid.show(
        Strings.alertMessages.NoTreeswithFilter,
        ToastAndroid.SHORT,
      );
    }
    setFinalList(tempfinalList);
    closeModal();
  };

  const renderImg = item => {
    // console.log(item.data.slice(0,30));
    return (
      <View style={{margin: 0, flexDirection: 'row', flexWrap: 'wrap'}}>
        <Image
          source={{uri: `data:image/jpeg;base64,${item.data}`}}
          style={{width: 100, height: 100}} // Set your desired image dimensions and margin
        />
      </View>
    );
  };
  const renderTree = tree => {
    return (
      <View
        style={{
          ...commonStyles.borderedDisplay,
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}>
        <View style={{justifyContent: 'space-around', flexGrow: 1}}>
          <Text style={{...commonStyles.text}}>
            {Strings.messages.SaplingNo}: {tree.sapling_id}
          </Text>
          <View style={{ width: 250 }}> 
      <Text style={{ ...commonStyles.text }}>{Strings.messages.Plot}: {plotNameFromId(tree.plot_id)}</Text>
    </View>
          <Text style={{...commonStyles.text}}>
            {Strings.messages.Type}: {typeNameFromId(tree.type_id)}
          </Text>

          {tree.uploaded ? (
            <Text style={{...commonStyles.success, ...commonStyles.label}}>
              {Strings.messages.Synced}
            </Text>
          ) : (
            <View
              style={{flexDirection: 'row', justifyContent: 'space-around'}}>
              <Text style={{...commonStyles.danger, ...commonStyles.label}}>
                {Strings.messages.Local}
              </Text>
              <MyIconButton
                name={'edit'}
                text={Strings.buttonLabels.edit}
                onPress={() => {
                  navigation.navigate(
                    Strings.screenNames.getString(
                      'EditLocalTree',
                      Strings.english,
                    ),
                    {sapling_id: tree.sapling_id},
                  );
                }}
              />
            </View>
          )}
        </View>
        {tree.images.length ? (
          <View style={{padding: 10}}>{renderImg(tree.images[0])}</View>
        ) : (
          <Text
            style={{
              flex: 1,
              flexWrap: 'wrap',
              flexShrink: 1,
              color: 'black',
              fontSize: 20,
              textAlign: 'center',
              backgroundColor: 'white',
              margin: 5,
              textAlignVertical: 'center',
            }}>
            {Strings.messages.NoImageFound}{' '}
          </Text>
        )}
      </View>
    );
  };
  const clearFilters = async () => {
    setFinalList(treeList);
    setSelectedPlot({});
    setSelectedTreeType({});
    setSelectedSaplingId({});
    setSelectedUploadStatus(uploadStatuses[0]);
  };
  const deleteSyncedTrees = async () => {
    const leftoverTrees = await Utils.deleteSyncedTrees();
    setFinalList(leftoverTrees);
    setTreeList(leftoverTrees);
  };

  return (
    <View style={{backgroundColor: '#5DB075', height: '100%'}}>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={closeModal}
        presentationStyle="formSheet">
        <ScrollView style={{margin: 10}}>
          <Text style={{...commonStyles.text5}}>
            {Strings.messages.Filters}
          </Text>
          <View>
            <View style={{...commonStyles.borderedDisplay}}>
              <Text style={{...commonStyles.text3}}>
                {Strings.labels.UploadStatus}:{' '}
              </Text>
              <CustomDropdown
                items={uploadStatusList}
                label={Strings.labels.UploadStatus}
                onSelectItem={setSelectedUploadStatus}
                initItem={selectedUploadStatus}
              />
            </View>
            <View style={{...commonStyles.borderedDisplay}}>
              <Text style={{...commonStyles.text3}}>
                {Strings.labels.SaplingId}:{' '}
              </Text>
              <CustomDropdown
                items={saplingIdList}
                label={Strings.labels.SaplingId}
                onSelectItem={setSelectedSaplingId}
                initItem={selectedSaplingId}
              />
            </View>
            <View style={{...commonStyles.borderedDisplay}}>
              <Text style={{...commonStyles.text3}}>
                {Strings.labels.TreeType}:{' '}
              </Text>
              <CustomDropdown
                items={treeTypeList}
                label={Strings.labels.TreeType}
                onSelectItem={setSelectedTreeType}
                initItem={selectedTreeType}
              />
            </View>
            <View style={{...commonStyles.borderedDisplay}}>
              <Text style={{...commonStyles.text3}}>
                {Strings.labels.Plot}:{' '}
              </Text>
              <CustomDropdown
                items={plotList}
                label={Strings.labels.Plot}
                onSelectItem={setSelectedPlot}
                initItem={selectedPlot}
              />
            </View>
          </View>
          <View style={{margin: 20}}>
            <Button
              title={Strings.buttonLabels.Apply}
              onPress={applychanges}
              color={'#5DB075'}
            />
          </View>
        </ScrollView>
      </Modal>

      {finalList === null ? (
        <Text style={commonStyles.text2}>{Strings.messages.LoadingTrees}</Text>
      ) : (
        <FlatList
          style={{backgroundColor: 'white'}}
          ListEmptyComponent={() => (
            <View style={{...commonStyles.borderedDisplay}}>
              <Text style={{...commonStyles.text5}}>
                {Strings.messages.NoTreesFound}
              </Text>
            </View>
          )}
          ListHeaderComponent={
            treeList &&
            treeList.length > 0 && (
              <View>
                <SyncDisplay onSyncComplete={() => fetchTreesFromLocalDB()} />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                  }}>
                  <MyIconButton
                    name={'filter'}
                    size={25}
                    text={Strings.buttonLabels.Filters}
                    onPress={openModal}
                  />
                  <MyIconButton
                    name={'delete'}
                    size={25}
                    text={Strings.buttonLabels.DeleteSyncedTrees}
                    onPress={() => Utils.confirmAction(deleteSyncedTrees)}
                    color="red"
                  />
                </View>
                {finalList !== treeList && (
                  <View style={{margin: 20, marginBottom: 5}}>
                    <Button
                      title={Strings.buttonLabels.ClearFilters}
                      onPress={clearFilters}
                      color={'black'}
                    />
                  </View>
                )}
              </View>
            )
          }
          data={finalList}
          renderItem={({item}) => renderTree(item)}></FlatList>
      )}
    </View>
  );
};

export default LocalDataView;
