import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, ToastAndroid, View } from 'react-native';
import { DataService } from '../services/DataService';
import { Strings } from '../services/Strings';
import { TreeForm, treeFormModes } from '../components/TreeForm';
import { Constants, Utils } from '../services/Utils';
import { commonStyles } from "../services/Styles";

const EditTreeScreen = ({ navigation }) => {
    const [saplingid, setSaplingid] = useState('');
    const [details, setDetails] = useState(null);
    const [newImages, setNewImages] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);
    const updateDetails = async (tree, images) => {
        const saplingData = {
            location: {
                type: "Point",
                coordinates: [0, 0]
            },
            sapling_id: "",
            image: details.inImages.map((image) => image.name),
            tree_id: "",//tree type id.
            plot_id: "",//plot id
        };
        const adminID = await Utils.getAdminId();
        saplingData.location.coordinates = [
            tree.lat, tree.lng
        ];
        saplingData.sapling_id = tree.saplingid;
        saplingData.plot_id = tree.plotid;
        saplingData.tree_id = tree.treeid;//tree type.
        for (let image of images) {
            let newImageIndex = newImages.findIndex((item) => item.name === image.name);
            if (newImageIndex !== -1) {
                newImages[newImageIndex].meta.remark = image.meta.remark;
                setNewImages(newImages);
            }
        }
        const requestData = {
            data: saplingData,
            newImages: newImages,
            deletedImages: deletedImages,
        }
        const response = await DataService.updateSapling(adminID, requestData);
        if (!response) {
            return;
        }
        console.log(requestData);
        let toastmsg = Strings.alertMessages.TreeUpdatedfirsthalf + response.data.sapling_id + Strings.alertMessages.TreeUpdatedsecondhalf;
        ToastAndroid.show(toastmsg, ToastAndroid.LONG);
        setDetails(null);
        setNewImages([]);
        setDeletedImages([]);
        //Format saplingData using tree,newIamges, deletedImages.
        // Dataservice.updateSapling call...
        // check reply.
    }

    const fetchTreeDetails = async () => {
        // console.log('fetching tree details');
        const adminID = await Utils.getAdminId();
        console.log(adminID)
        setDetails(null);
        setNewImages([]);
        setDeletedImages([]);

        const treeDetails = await DataService.fetchTreeDetails(saplingid, adminID);
        if (!treeDetails) { return; }
        const detailsForTreeForm = { ...Constants.treeFormTemplateData };
        const treeType = await Utils.treeTypeFromID(treeDetails.tree_id);
        const plot = await Utils.plotFromPlotID(treeDetails.plot_id);
        detailsForTreeForm.inImages = treeDetails.image;//TODO: server should return:
        for (let image of detailsForTreeForm.inImages) {
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
        if (treeDetails.location) {
            detailsForTreeForm.inLat = treeDetails.location.coordinates[0];
            detailsForTreeForm.inLng = treeDetails.location.coordinates[1];
        }
        detailsForTreeForm.inSaplingId = treeDetails.sapling_id;
        detailsForTreeForm.inTreeType = treeType;
        detailsForTreeForm.inPlot = plot;
        detailsForTreeForm.inUserId = treeDetails.user_id;
        // console.log(detailsForTreeForm);
        setDetails(detailsForTreeForm);
    }
    if (details) {
        return <TreeForm
            mode={treeFormModes.remoteEdit}
            treeData={details}
            onCancel={() => setDetails(null)}
            updateUserId={false}
            updateLocation={false}
            onVerifiedSave={updateDetails}
            onNewImage={(image) => { setNewImages([...newImages, image]); }}
            onDeleteImage={(name) => { setDeletedImages([...deletedImages, name]); }}
        />
    }
    else {
        return (
            <View style={{ backgroundColor: '#5DB075', height: '100%' }}>
                <View style={{ backgroundColor: 'white', margin: 10, borderRadius: 10 }}>
                    <Text style={{ color: 'black', marginLeft: 20, margin: 10, fontSize: 18 }}>{Strings.messages.EnterSaplingId}</Text>
                    <TextInput
                        style={commonStyles.txtInput}
                        placeholder={Strings.labels.SaplingId}
                        placeholderTextColor={'#808080'}
                        onChangeText={(text) => setSaplingid(text)}
                        value={saplingid}
                    />
                    <View style={{ margin: 20 }}>
                        <Button
                            title={Strings.buttonLabels.Search}
                            onPress={() => fetchTreeDetails()}
                            color={'#5DB075'}
                        />
                    </View>
                </View>
            </View>
        )
    }
}

export default EditTreeScreen;
