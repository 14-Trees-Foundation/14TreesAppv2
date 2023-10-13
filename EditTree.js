import React, {useEffect,useState} from 'react';
import { View, Text,TextInput, Button,  Alert, StyleSheet, TouchableOpacity} from 'react-native';
import { Dropdown } from './DropDown';
import { DataService } from './DataService';

const EditTreeScreen = ({navigation}) => {
    const [saplingid, setSaplingid] = useState('');
    const [selectedTreeType, setSelectedTreeType] = useState('');
    const [selectedPlot, setSelectedPlot] = useState('');
    const [treeItems, setTreeItems] = useState([]);
    const [plotItems, setPlotItems] = useState([]);

    const fetchTreeDetails = async () => {
        // console.log('fetching tree details');
        // const treeDetails = await DataService.fetchTreeDetails(saplingid);
        // setSelectedTreeType(treeDetails.data.treeType);
        // setSelectedPlot(treeDetails.data.plot);
        // let trees = await getTreesList(db);
        // let plots = await getPlotsList(db);
        // setTreeItems(trees);
        // setPlotItems(plots);
    }
    

    return (
        <View style={{backgroundColor:'#5DB075', height:'100%'}}>
           <Text style={styles.headerText} > Edit tree  </Text>
           <View style={{backgroundColor:'white', margin: 10,borderRadius:10}}>
                <Text style={{color:'black', marginLeft:20, margin:10, fontSize:18}}> Enter the Sapling ID</Text>
                <TextInput
                    style={styles.txtInput}
                    placeholder="sapling id"
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
                <Text style={{color:'black', marginLeft:20, margin:10, fontSize:18}}> Details : </Text>
                <Text style={{color:'black', marginLeft:25, margin:10, fontSize:18}}> Current Tree Type : {selectedTreeType} </Text>
                <Text style={{color:'black', marginLeft:25, margin:10, fontSize:18}}> Current Plot : {selectedPlot} </Text>
                <Dropdown
                    items={treeItems}
                    label= "Edit Tree Type"
                    setSelectedItems={setSelectedTreeType}
                    selectedItem={selectedTreeType}
                />
                <Dropdown
                    items={plotItems}
                    label="Edit Plot"
                    setSelectedItems={setSelectedPlot}
                    selectedItem={selectedPlot}
                />
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