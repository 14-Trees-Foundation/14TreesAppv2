import React, { useState, useEffect, useContext } from 'react';
import { Button, StyleSheet, Text, TextInput, ToastAndroid, View, BackHandler, TouchableOpacity } from 'react-native';
import { DataService } from '../services/DataService';
import { Strings } from '../services/Strings';
import { TreeForm, treeFormModes } from '../components/TreeForm';
import { Constants, Utils } from '../services/Utils';
import { commonStyles } from "../services/Styles";
import GlobalContext from '../context/GlobalContext ';

const EditTreeScreen = ({ navigation }) => {
    const [saplingid, setSaplingid] = useState(null);
    const [details, setDetails] = useState(null);
    const [newImages, setNewImages] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);

    const { langChanged, lightTheme } = useContext(GlobalContext);

    useEffect(() => {
        const backAction = () => {
            navigation.goBack()
            return true; // Prevent default behavior (exit app)
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, [])

    useEffect(() => {
        console.log("langChanged inside EditTreeScreen: ", langChanged);
    }, [langChanged]);

    const updateDetails = async (tree, images) => {
        // console.log("tree details from edit----", tree);
        //console.log("images details from edit----",  images);

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
        console.log("adminID inside edit tree screen----", adminID);
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

        let newImagesArr = newImages.slice(-1);

        const requestData = {
            data: saplingData,
            newImages: newImagesArr,
            deletedImages: deletedImages,
        }

        console.log("new images: ", newImagesArr.length, "deleted images: ", deletedImages.length);
        console.log("tree details from edit----", requestData.data);
        
        console.log("new last images: ", newImages[newImages.length - 1]);
        const response = await DataService.updateSapling(adminID, requestData);
        if (!response) {
            return;
        }
        let toastmsg = Strings.alertMessages.TreeUpdatedfirsthalf + response.data.sapling_id + Strings.alertMessages.TreeUpdatedsecondhalf;
        ToastAndroid.show(toastmsg, ToastAndroid.LONG);
        setDetails(null);
        setNewImages([]);
        setDeletedImages([]);
        setSaplingid(null);
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
        // detailsForTreeForm.inShiftId = treeDetails.shiftID;
        // detailsForTreeForm.inSequenceNo = treeDetails.sequenceNo
         console.log(detailsForTreeForm.inShiftId, detailsForTreeForm.inSequenceNo);
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
            <View style={{ backgroundColor: 'white', height: '100%' }}>
                <Text style={{ ...commonStyles.textSync, color: lightTheme ? '#52525C' : 'black', margin: 20, fontSize: 20 }}>{Strings.messages.EnterSaplingId}</Text>

                <TextInput
                    style={{ ...commonStyles.txtInput, color: lightTheme ? '#52525C' : 'black', fontSize: 15, borderRadius: 13, width: '85%' }}
                    placeholder={Strings.labels.SaplingId}
                    placeholderTextColor={'#52525C'}
                    onChangeText={(text) => setSaplingid(text)}
                    value={saplingid}
                />

                <View style={{ margin: 20, marginHorizontal: 80 }}>
                    <TouchableOpacity style={commonStyles.searchButton} onPress={() => fetchTreeDetails()}>
                        <Text style={{ fontFamily: 'Inter-Regular', fontWeight: 'bold', color: 'white', fontSize: 20, marginTop: 3 }}>
                            {Strings.buttonLabels.Search}
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>
        )
    }
}

export default EditTreeScreen;
