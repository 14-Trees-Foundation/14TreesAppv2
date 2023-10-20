import React, {useEffect,useState} from 'react';
import { View, Text,TextInput, Button,  Alert, StyleSheet, TouchableOpacity, ToastAndroid} from 'react-native';
import { Dropdown } from './DropDown';
import { DataService } from './DataService';
import { Constants, Utils } from './Utils';
import { TreeForm } from './TreeForm';

const EditTreeScreen = ({navigation}) => {
    const [saplingid, setSaplingid] = useState('');
    const [details,setDetails] = useState(null);
    const [newImages,setNewImages] = useState([]);
    const [deletedImages,setDeletedImages] = useState([]);
    const updateDetails = async(tree, images)=>{
        const saplingData = {
            location:{
                type:"Point",
                coordinates:[0,0]
            },
            sapling_id:"",
            image:details.inImages.map((image)=>image.name),
            tree_id:"",//tree type id.
            plot_id:"",//plot id
        };
        const adminID = await Utils.getAdminId();
        let a = {"sapling":{
            "data":{
                "location": {
                    "type": "Point",
                    "coordinates": [
                        20.1339558,
                        72.9084718
                    ]
                },
                "sapling_id": "10001",
                "tree_id": "tree_id",
                "plot_id": "61bc101f969efcff564fb581",
            },
            "newImages":[
                // {} use david mitchell image from uploadTrees.
                {
                    "meta":{
                        "captureTimestamp":"2023-10-09T16:29:50.240Z",//obtained in JS using (new Date()).toISOString()
                        "remark":"Looks alright."
                    },
                    "name":"DavidMitchellNew2.png",
                    "data":""
                }
            ],
            "deletedImages":[
                "https://14treesplants.s3.ap-south-1.amazonaws.com/dev/trees/10001_2023-10-03T17%3A54%3A34.832Z.jpg"
            ]
        }}
        saplingData.location.coordinates = [
                tree.lat, tree.lng
            ];
        saplingData.sapling_id = tree.saplingid;
        saplingData.plot_id = tree.plotid;
        saplingData.tree_id = tree.treeid;//tree type.
        const requestData = {
            data:saplingData,
            newImages:newImages,
            deletedImages:deletedImages,
        }
        const response = await DataService.updateSapling(adminID,requestData);
        if(!response){
            return;
        }
        console.log(requestData);
        ToastAndroid.show(`Tree with ${response.data.sapling_id} updated!`,ToastAndroid.LONG);
        setDetails(null);
        setNewImages([]);
        setDeletedImages([]);
        //Format saplingData using tree,newIamges, deletedImages.
        // Dataservice.updateSapling call...
        // check reply.
    }
    const updateRemark = async(remark,imageName)=>{
        const imageList = newImages;
        let index = imageList.findIndex((image)=>image.name===imageName);
        if(index!==-1){
            imageList[index].meta.remark = remark;
            setNewImages(imageList);
        }
    }
    const fetchTreeDetails = async () => {
        // console.log('fetching tree details');
        const adminID = await Utils.getAdminId();
        console.log(adminID)
        const treeDetails = await DataService.fetchTreeDetails(saplingid,adminID);
        if(!treeDetails){return;}
        const detailsForTreeForm = {...Constants.treeFormTemplateData};
       const treeType = await Utils.treeTypeFromID(treeDetails.tree_id);
       const plot = await Utils.plotFromPlotID(treeDetails.plot_id);
       detailsForTreeForm.inImages = treeDetails.image;//TODO: server should return:
       for(let image of detailsForTreeForm.inImages){
        image.data = await DataService.fileURLToBase64(image.name);
       }
       /*
        {
            data: generate on spot,
            name: s3url,
            meta: {
                capturetimestamp: timestamp,
                remark: 'default remark',
            }
        }
       */
    //   console.log(detailsForTreeForm);
    //   detailsForTreeForm.inImages = [];
       detailsForTreeForm.inLat = 0;
       detailsForTreeForm.inLng = 0;
        if(treeDetails.location){
            detailsForTreeForm.inLat = treeDetails.location.coordinates[0];
            detailsForTreeForm.inLng = treeDetails.location.coordinates[1];
        }
        detailsForTreeForm.inSaplingId = treeDetails.sapling_id;
        detailsForTreeForm.inTreeType = treeType;
        detailsForTreeForm.inPlot = plot;
        detailsForTreeForm.inUserId = treeDetails.user_id;
        console.log(detailsForTreeForm);
        setDetails(detailsForTreeForm);
    }
    return (
        <View style={{backgroundColor:'#5DB075', height:'100%'}}>
            {
                details?
                <TreeForm
                 treeData={details}
                 onCancel={()=>setDetails(null)}
                 updateUserId={false}
                 updateLocation={false}
                 onVerifiedSave={updateDetails}
                 onRemarkChange={(remark,imageName)=>{updateRemark(remark,imageName);}}
                 onNewImage={(image)=>{setNewImages([...newImages,image]);}}
                 onDeleteImage={(name)=>{setDeletedImages([...deletedImages,name]);}}
                 />
                :
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
            </View>

            }
            
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