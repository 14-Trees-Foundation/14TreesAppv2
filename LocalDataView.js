//TODO: user_id not stored in tree table for some reason. Check it, fix it.
// add tree screen

import React, { useEffect, useState } from 'react';
import {
  Button,
  FlatList,
  Image,
  Modal,
  StyleSheet, Switch, Text,
  ToastAndroid,
  View
} from 'react-native';
import { Dropdown } from './DropDown';
// import * as ImagePicker from 'react-native-image-picker';
import { Utils, commonStyles } from './Utils';
import { useFocusEffect } from '@react-navigation/native';
import { CustomButton } from './Components';
import { CustomDropdown } from './CustomDropdown';
import { Strings } from './Strings';



const LocalDataView = ({ navigation }) => {

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
  const uploadStatuses = [
    { name: 'Any', value: 0 },
    { name: 'Local', value: 1 },
    { name: 'Synced', value: 2 }
  ]
  const [selectedUploadStatus, setSelectedUploadStatus] = useState(uploadStatuses[0]);
  const fetchTreesFromLocalDB = () => {
    Utils.fetchTreesFromLocalDB().then((trees) => {
      // console.log(trees)
      setTreeList(trees)
      setFinalList(trees)
    })
  }
  useEffect(() => {
    setUploadStatusList(uploadStatuses);
    Utils.getUserId().then((id) => {
      setUserId(id);
    })
    // // loadDataCallback();
    Utils.fetchTreeTypesFromLocalDB().then((types) => {
      console.log(types)
      setTreeTypeList(types)
    })
    Utils.fetchPlotNamesFromLocalDB().then((plots) => {
      console.log(plots)
      setPlotList(plots)
    })
    Utils.fetchSaplingIdsFromLocalDB().then((ids) => {
      console.log(ids)
      setsaplingIdList(ids)
    })
    // console.log('local data view')
  }, [])
  useFocusEffect(React.useCallback(() => {
    fetchTreesFromLocalDB();
  }, []))
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const applychanges = () => {
    let tempfinalList = [];
    console.log(selectedTreeType)
    console.log(selectedPlot)
    console.log(selectedSaplingId)
    // how to check whether the selectedSaplingId is null or not
    tempfinalList = treeList;
    if (Object.keys(selectedSaplingId).length !== 0) {
      console.log('sapling id selected')
      tempfinalList = tempfinalList.filter((tree) => tree.sapling_id === selectedSaplingId.name)
    }
    if (Object.keys(selectedPlot).length === 0 && Object.keys(selectedTreeType).length !== 0) {
      console.log('only tree type selected')
      tempfinalList = tempfinalList.filter((tree) => tree.type_id === selectedTreeType.value)
    }
    if (Object.keys(selectedPlot).length !== 0 && Object.keys(selectedTreeType).length === 0) {
      console.log('only plot selected')
      tempfinalList = tempfinalList.filter((tree) => tree.plot_id === selectedPlot.value)
    }
    if (Object.keys(selectedPlot).length !== 0 && Object.keys(selectedTreeType).length !== 0) {
      console.log('both plot and tree type selected')
      tempfinalList = tempfinalList.filter((tree) => tree.plot_id === selectedPlot.value && tree.type_id === selectedTreeType.value)
    }
    if (selectedUploadStatus !== uploadStatuses[0]) {
      const wantUploaded = selectedUploadStatus.value === uploadStatuses[2].value;//'Synced'
      console.log(selectedUploadStatus, uploadStatuses[2]);
      console.log(wantUploaded);
      console.log(tempfinalList);
      tempfinalList = tempfinalList.filter((tree) => (tree.uploaded === wantUploaded))
    }
    if (tempfinalList.length === 0) {
      ToastAndroid.show(Strings.alertMessages.NoTreeswithFilter, ToastAndroid.SHORT);
    }
    setFinalList(tempfinalList);
    closeModal();
  }

  //fetch userId from Async Storage.
  // AsyncStorage.getItem(Constants.userIdKey).then((userid)=>{
  //   userId = userid;
  // })
  // image handle---------------------  
  const renderImg = (item) => {
    // console.log(item.data.slice(0,30));
    return (
      <View style={{ margin: 0, flexDirection: 'row', flexWrap: 'wrap' }}>
        <Image
          source={{ uri: `data:image/jpeg;base64,${item.data}` }}
          style={{ width: 100, height: 100, }} // Set your desired image dimensions and margin
        />
      </View>
    );
  }
  const renderTree = (tree) => {
    return (
      <View style={{
        margin: 10,
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center'
      }}>


        <View style={{ padding: 20, }}>
          <Text style={styles.text3}>{Strings.languages.SaplingNo} {tree.sapling_id}</Text>
          <Text style={styles.text3}>{Strings.languages.PlotId}{tree.plot_id}</Text>
          <Text style={styles.text3}> {Strings.languages.TypeId} {tree.type_id}</Text>

          {(tree.uploaded) ?
            <Text style={{ ...styles.success, ...styles.label }}>{Strings.languages.Synced}</Text>
            :
            <Text style={{ ...styles.danger, ...styles.label }}>{Strings.languages.Local}</Text>}
        </View>
        {
          tree.images.length ?
            <View style={{ padding: 10 }}>
              {renderImg(tree.images[0])}
            </View>
            :
            <Text style={{ flex: 1, flexWrap: 'wrap', flexShrink: 1, color: 'black', fontSize: 20, textAlign: 'center', backgroundColor: 'white', margin: 5, textAlignVertical: 'center' }}>{Strings.languages.NoImageFound} </Text>
        }
      </View>
    )
  }
  const clearFilters = async () => {
    setFinalList(treeList);
    setSelectedPlot({});
    setSelectedTreeType({});
    setSelectedSaplingId({});
    setSelectedUploadStatus(uploadStatuses[0]);
  }
  const deleteSyncedTrees = async () => {
    const leftoverTrees = await Utils.deleteSyncedTrees();
    setFinalList(leftoverTrees);
    setTreeList(leftoverTrees);
  }
  return (

    <View style={{ backgroundColor: '#5DB075', height: '100%' }}>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={closeModal}
        presentationStyle='formSheet'
      >
        <View style={{ margin: 20 }}>
          <Text style={{ ...styles.text3, fontSize: 20 }}>{Strings.languages.Filters}</Text>
          <View style={{ margin: 5 }}>
            <CustomDropdown
              items={uploadStatusList}
              label={Strings.labels.UploadStatus}
              onSelectItem={setSelectedUploadStatus}
              initItem={selectedUploadStatus}
            />
          </View>

          <View style={{ margin: 5 }}>
            <CustomDropdown
              items={saplingIdList}
              label={Strings.labels.SaplingId}
              onSelectItem={setSelectedSaplingId}
              initItem={selectedSaplingId}
            />
          </View>
          <View style={{ margin: 5 }}>
            <CustomDropdown
              items={treeTypeList}
              label={Strings.labels.TreeType}
              onSelectItem={setSelectedTreeType}
              initItem={selectedTreeType}
            />
          </View>
          <View style={{ margin: 5 }}>
            <CustomDropdown
              items={plotList}
              label={Strings.labels.Plot}
              onSelectItem={setSelectedPlot}
              initItem={selectedPlot}
            />
          </View>
          <View style={{ margin: 20 }}>
            <Button title={Strings.buttonLabels.Apply} onPress={applychanges} color={'#5DB075'} />
          </View>
        </View>
        {/* </View> */}
      </Modal>


      {
        finalList === null ? <Text style={styles.text2}>{Strings.languages.LoadingTrees}</Text>
          :
          <FlatList
            ListEmptyComponent={
              <Text style={commonStyles.text2}>{Strings.languages.NoTreesFound}</Text>
            }
            ListHeaderComponent={
              (treeList&&treeList.length>0)&&<View>
                  <View>
                    <CustomButton text={Strings.buttonLabels.DeleteSyncedTrees}opacityStyle={{ backgroundColor: 'red', margin: 20, marginBottom: 0 }} onPress={() => Utils.confirmAction(deleteSyncedTrees)}></CustomButton>
                  </View>
                  <View style={{ margin: 20, marginBottom: 5 }}>
                    <CustomButton text={Strings.buttonLabels.Filters} onPress={openModal} color={'black'} />
                  </View>
                  {(finalList !== treeList) && <View style={{ margin: 20, marginBottom: 5 }}>
                    <Button title={Strings.buttonLabels.ClearFilters} onPress={clearFilters} color={'black'} />
                  </View>
                  }
                </View>
            }
            data={finalList} renderItem={({ item }) => renderTree(item)}></FlatList>



      }

    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 10,
    fontSize: 15,
    alignContent: 'center',
    color: 'white',
    textAlign: 'center',
    width: 'auto',
    padding: 5,
    margin: 5
  },
  success: {
    backgroundColor: 'green',
  },
  danger: {
    backgroundColor: 'red',
  },
  btnview: {
    justifyContent: 'center',
    elevation: 3,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  btn: {
    paddingHorizontal: 20,
    borderRadius: 9,
    backgroundColor: '#1f3625',
    alignItems: 'center',
    paddingVertical: 12,
    height: 50,
  },
  btndisabled: {
    paddingHorizontal: 20,
    borderRadius: 9,
    backgroundColor: '#686868',
    alignItems: 'center',
    paddingVertical: 12,
    height: 50,
  },
  text: {
    fontSize: 14,
    color: '#1f3625',
    textAlign: 'center',
  },
  text3: {
    fontSize: 14,
    color: 'black',
    fontSize: 20,
    textAlign: 'left',
  },
  text2: {
    fontSize: 25,
    color: 'white',
    textAlign: 'center',
    marginVertical: 5,
    marginBottom: 40,
  },
  recordTxt: {
    fontSize: 18,
    color: '#1f3625',
    marginTop: 5,
    marginBottom: 5,
    textAlign: 'center',
  },
  btntxt: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
  },
  txtInput: {
    height: 60,
    width: 310,
    borderWidth: 0.5,
    borderColor: 'grey',
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginTop: 30,
    marginBottom: 10,
    padding: 10,
    color: 'black', // Change font color here
    fontSize: 16,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  headerText: {
    fontSize: 30, color: 'white', textAlign: 'center', marginTop: 30, marginBottom: 30, fontFamily: 'cochin', fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  }
});

export default LocalDataView;