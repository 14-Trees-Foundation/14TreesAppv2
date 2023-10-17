import React, {useEffect,useState} from 'react';
import { View, Text,TextInput, Button,  Alert, StyleSheet, TouchableOpacity, ToastAndroid} from 'react-native';
import { Dropdown } from './DropDown';
import { DataService } from './DataService';
import { Utils } from './Utils';

const EditTreeScreen = ({navigation}) => {
    const [saplingid, setSaplingid] = useState('');
    const [details,setDetails] = useState(null);
    const [treeItems, setTreeItems] = useState([]);
    const [plotItems, setPlotItems] = useState([]);
    const [treeType,setTreeType] = useState({name:'',value:''});
    const [plot,setPlot] = useState({name:'',value:''});
    const makeDetailsHumanReadable = async()=>{
        if(details){
            const treeType =await Utils.treeTypeFromID(details.tree_id);
            setTreeType(treeType);
            const plot = await Utils.plotFromPlotID(details.plot_id);
            setPlot(plot);
        }
    }
    const updateDetails = async()=>{
        ToastAndroid.show('Send request to server',ToastAndroid.SHORT);
    }
    const setDropDownItems = async()=>{
        const treetypes = await Utils.fetchTreeTypesFromLocalDB();
        const plots = await Utils.fetchPlotNamesFromLocalDB();
        setTreeItems(treetypes);
        setPlotItems(plots);
        console.log(plots.length,treetypes.length, 'set plots and treetypes')
    }
    useEffect(()=>{
        setDropDownItems();        
    },[])
    useEffect(()=>{
        //human readable details update.
        makeDetailsHumanReadable();
        // setTreeType(await Utils.treeTypeFromID(details.tree_id))
        // setTreeType(await Utils.plot(details.tree_id))
    },[details])
    const fetchTreeDetails = async () => {
        // console.log('fetching tree details');
        const adminID = await Utils.getAdminId();
        console.log(adminID)
        const treeDetails = await DataService.fetchTreeDetails(saplingid,adminID);
        setDetails(treeDetails);
        // let trees = await getTreesList(db);
        // let plots = await getPlotsList(db);
    }
    return (
        <View style={{backgroundColor:'#5DB075', height:'100%'}}>
           <Text style={styles.headerText} > Edit tree  </Text>
           <View style={{backgroundColor:'white', margin: 10,borderRadius:10}}>
                <Text style={{color:'black', marginLeft:20, margin:10, fontSize:18}}> Enter the Sapling ID</Text>
                <TextInput
                    style={styles.txtInput}
                    placeholder="Sapling ID"
                    placeholderTextColor={'#808080'}
                    onChangeText={(text) => setSaplingid(text)}
                    value={saplingid}
                />
                <View style={{margin:20}}>
                    <Button
                        title="Search"
                        onPress={() => fetchTreeDetails()}
                        color={'#5DB075'}
                    />
                </View>
                {
                    details?
                    <View>
                        <Text style={{color:'black', marginLeft:20, margin:10, fontSize:18}}> Details : </Text>
                        <Dropdown
                            items={treeItems}
                            label="Select Tree Type"
                            setSelectedItems={setTreeType}
                            selectedItem={treeType}
                            
                        />
                        <Dropdown
                            items={plotItems}
                            label="Select Plot"
                            setSelectedItems={setPlot}
                            selectedItem={plot}
                        />
                        <Button title="Update Tree" onPress={updateDetails}></Button>
                    </View>
                    :
                    <View></View>

                }
            </View>
            
        </View>
    )
}

export default EditTreeScreen;

const styles = StyleSheet.create({
    headerText: {
      fontSize: 30, color: 'white', textAlign: 'center', marginTop: 30, marginBottom: 30, fontFamily:'cochin', fontWeight:'bold' , textShadowColor: 'rgba(0, 0, 0, 0.5)', 
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3, 
    },
    txtInput: {
        height: 60,
        width: 310,
        borderWidth: 0.5,
        borderColor: 'grey',
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
        marginTop: 10,
        marginBottom: 10,
        padding: 10,
        color: 'black', // Change font color here
        fontSize: 16,
        fontWeight: 'bold',  
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
      },
  });