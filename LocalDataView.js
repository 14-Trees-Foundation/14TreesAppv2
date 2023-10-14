//TODO: user_id not stored in tree table for some reason. Check it, fix it.
// add tree screen

import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert, Button,
    FlatList,
    Image,
    StyleSheet, Text,ScrollView,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    Modal,
    View
} from 'react-native';
import { Dropdown } from './DropDown';
import {
    createTable,
    getDBConnection,
    getPlotsList,
    getTreesList,
    getUsersList,
    saveTreeImages,
    saveTrees
} from './tree_db';
// import * as ImagePicker from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import { launchCamera } from 'react-native-image-picker';
import { Utils } from './Utils';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';



const LocalDataView = ({navigation}) => {

    let userId = Utils.userId;
    const [treeList,setTreeList] = useState(null);
    const [treeTypeList,setTreeTypeList] = useState([]);
    const [plotList,setPlotList] = useState([]);
    const [saplingIdList,setsaplingIdList] = useState([]);

    const [selectedTreeType, setSelectedTreeType] = useState({});
    const [selectedPlot, setSelectedPlot] = useState({});
    const [selectedSaplingId, setSelectedSaplingId] = useState({});

    // const loadDataCallback = useCallback(async () => {
    //   try {
    //     let treenames = await Utils.fetchTreeNamesFromLocalDB();
    //     let plots = await Utils.fetchPlotNamesFromLocalDB();
    //     let saplingids = await Utils.fetchSaplingIdsFromLocalDB();
    //     setTreeTypeList(treenames);
    //     setPlotList(plots);
    //     setsaplingIdList(saplingids);
    //     console.log('local data view')
    //     console.log(treeTypeList)
    //     console.log(plotList)
    //     console.log(saplingIdList)
    //   } catch (error) {
    //     console.error(error);
    //   }
    // }, []);

   
    useEffect(()=>{
        Utils.fetchTreesFromLocalDB().then((trees)=>{
            // console.log(trees)
            setTreeList(trees)
        })
        // // loadDataCallback();
        Utils.fetchTreeNamesFromLocalDB().then((types)=>{
            console.log(types)
            setTreeTypeList(types)
        })
        Utils.fetchPlotNamesFromLocalDB().then((plots)=>{
            console.log(plots)
            setPlotList(plots)
        })
        Utils.fetchSaplingIdsFromLocalDB().then((ids)=>{
            console.log(ids)
            setsaplingIdList(ids)
        })

        // console.log('local data view')
    },[])


    useEffect(()=>{
        console.log('local data view')
        console.log(selectedTreeType)
        console.log(selectedPlot)
        console.log(selectedSaplingId)
      
    }
    ,[selectedTreeType,selectedPlot,selectedSaplingId])
    


    
    const [modalVisible, setModalVisible] = useState(false);

    const openModal = () => {
      setModalVisible(true);
    };

    const closeModal = () => {
      setModalVisible(false);
    };

    //fetch userId from Async Storage.
    // AsyncStorage.getItem(Constants.userIdKey).then((userid)=>{
    //   userId = userid;
    // })
    // image handle---------------------  
    const renderImg = ({ item }) => {
        // console.log(item)
        // console.log(item.data.slice(0,30));
        return (
            <View  style={{margin:0, flexDirection:'row', flexWrap:'wrap'}}>
              <Image
                source={{ uri: `data:image/jpeg;base64,${item.data}` }}
                style={{ width: 100, height: 100, }} // Set your desired image dimensions and margin
              />
            </View>
          );
    }
    const renderTree = (tree)=>{
        return (
            <View style={{
                margin:10,
                 borderWidth: 2,
                borderColor: 'white',
                borderRadius: 10,
                flexDirection:'row'
            }}>

              
                <View style={{padding: 20,}}>
                    <Text style={styles.text3}>Sapling ID: {tree.sapling_id}</Text>
                    <Text style={styles.text3}>Plot ID: {tree.plot_id}</Text>  
                    <Text style={styles.text3}>Type ID: {tree.type_id}</Text>
                  
                  {(tree.uploaded) ?
                <Text style={{...styles.success,...styles.label}}>Synced</Text>
                :
                <Text style={{...styles.danger,...styles.label}}>Local</Text>}
                </View>
                <View style={{padding:10}}>
                    {renderImg({item:tree.images[0]})}
                </View>
            </View>
        )
    }
    return (
    
   <View style={{backgroundColor:'#5DB075', height:'100%'}}>
        <Text style={styles.headerText}>Local Trees</Text>
        <View style={{margin:20}}>
          <Button title="Filters" onPress={openModal} color={'black'} />
        </View>
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={{backgroundColor:'#white', height:'100%'}}>
            <View style={{margin:20}}>
              <Text style={{...styles.text3, fontSize:20}}>Filters</Text>
            
              <View style={{margin:20}}>
                <Text style={{...styles.text3, fontSize:15}}>Sapling ID</Text> 
                <Dropdown 
                  items={saplingIdList}
                  label="Sapling ID"
                  setSelectedItems={setSelectedSaplingId}
                  selectedItems={selectedSaplingId}
                />
                 <Text style={{...styles.text3, fontSize:15}}>{selectedSaplingId.name}</Text> 
              </View> 
              <View style={{margin:20}}>
                <Text style={{...styles.text3, fontSize:15}}>Tree Type </Text>
                <Dropdown
                items={treeTypeList}
                label={'Tree Type '}
                setSelectedItems={setSelectedTreeType}
                selectedItems={selectedTreeType}
                />
                  <Text style={{...styles.text3, fontSize:15}}>{selectedTreeType.name}</Text> 
              </View>
              <View style={{margin:20}}>
                <Text style={{...styles.text3, fontSize:15}}>Plot </Text>
                <Dropdown 
                items={plotList}
                label={'Plot '}
                setSelectedItems={setSelectedPlot}
                selectedItems={selectedPlot}

                />
              </View>
              <View style={{margin:20}}>
                <Button title="Apply" onPress={closeModal} color={'#5DB075'} />
              </View>
            </View>
          </View>
      </Modal>
          
       
        {
            treeList===null?<Text style={styles.text2}>Loading Trees...</Text>
            :
              
            
                <FlatList data={treeList} renderItem={({item})=>renderTree(item)}></FlatList>

            
            
        }
        
   </View>
    );
}

const styles = StyleSheet.create({
  label:{
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 10,
    fontSize:15,
    alignContent:'center',
    color:'white',
    textAlign:'center',
    width:'auto',
    padding:5,
    margin:5
  },
    success:{
      backgroundColor:'green',
    },
    danger:{
      backgroundColor:'red',
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
        fontSize:20,
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
      fontSize: 30, color: 'white', textAlign: 'center', marginTop: 30, marginBottom: 30, fontFamily:'cochin', fontWeight:'bold' , textShadowColor: 'rgba(0, 0, 0, 0.5)', 
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3, 
    }
  });

export default LocalDataView;