import React, { useState, useEffect, useContext } from 'react';
import { Button, Text, TextInput, ToastAndroid, View, BackHandler, TouchableOpacity, Alert } from 'react-native';
import { DataService } from '../services/DataService';
import { Strings } from '../services/Strings';
import { TreeForm, treeFormModes } from '../components/TreeForm';
import { Constants, Utils } from '../services/Utils';
import { commonStyles, editRemoteTreeStyles } from "../services/Styles";
import GlobalContext from '../context/GlobalContext ';

const EditTreeScreen = ({ navigation }) => {
    const [saplingId, setSaplingId] = useState(null);
    const [details, setDetails] = useState(null);
    const [newImages, setNewImages] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);

    const { langChanged, lightTheme } = useContext(GlobalContext);

    useEffect(() => {
        const backAction = () => {
            navigation.goBack()
            return true;
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
            image: details.inImage.name,
            plant_type_id: "",//tree type id.
            plot_id: "",//plot id
        };

        saplingData.location.coordinates = [
            tree.lat, tree.lng
        ];
        saplingData.sapling_id = tree.sapling_id;
        saplingData.plot_id = tree.plot_id;
        saplingData.plant_type_id = tree.plant_type_id;//tree type.

        for (let image of images) {
            let newImageIndex = newImages.findIndex((item) => item.name === image.name);
            if (newImageIndex !== -1) {
                newImages[newImageIndex].meta.remark = image.meta.remark;
                setNewImages(newImages);
            }
        }

        let newImagesArr = newImages.slice(-1);

        const requestData = {
            tree: saplingData,
            new_image: newImagesArr.length !== 0 ? newImagesArr[0] : null,
            delete_image: deletedImages,
        }

        console.log("new images: ", newImagesArr.length, "deleted images: ", deletedImages.length);
        console.log("tree details from edit----", requestData.data);

        console.log("new last images: ", newImages[newImages.length - 1]);
        const response = await DataService.updateSapling(requestData);

        if (!response) {
            let toastmsg = Strings.alertMessages.FailedUpdateSapling + saplingId + Strings.alertMessages.ContactExpert;
            ToastAndroid.show(toastmsg, ToastAndroid.LONG);
            return;
        }

        let toastmsg = Strings.alertMessages.TreeUpdatedfirsthalf + response.data.sapling_id + Strings.alertMessages.TreeUpdatedsecondhalf;
        ToastAndroid.show(toastmsg, ToastAndroid.LONG);
        setDetails(null);
        setNewImages([]);
        setDeletedImages([]);
        setSaplingId(null);
    }

    const fetchTreeDetails = async () => {
        // console.log('fetching tree details');
        setDetails(null);
        setNewImages([]);
        setDeletedImages([]);

        const treeDetails = await DataService.fetchTreeDetails(saplingId);
        if (!treeDetails) {
            ToastAndroid.show(`${Strings.alertMessages.UnableToFetch} ${saplingId} `, ToastAndroid.LONG);
            return;
        }

        const detailsForTreeForm = { ...Constants.treeFormTemplateData };
        const treeType = await Utils.treeTypeFromID(treeDetails.plant_type_id);
        const plot = await Utils.plotFromPlotID(treeDetails.plot_id);
        detailsForTreeForm.inImage = treeDetails.image;//TODO: server should return:

        if (treeDetails.image?.name) image.data = await DataService.fileURLToBase64(treeDetails.image.name);

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
        setDetails(detailsForTreeForm);
    }

    const handlePress = async () => {
        if (saplingId === "" || !saplingId) {
            Alert.alert(Strings.alertMessages.EmptyField, Strings.alertMessages.EmptySaplingField);
            return
        }

        fetchTreeDetails()
    }

    if (details) {
        return (
            <TreeForm
                mode={treeFormModes.remoteEdit}
                treeData={details}
                onCancel={() => setDetails(null)}
                onVerifiedSave={updateDetails}
                onNewImage={(image) => { setNewImages([...newImages, image]); }}
                onDeleteImage={(name) => { setDeletedImages([...deletedImages, name]); }}
            />)
    }
    else {
        return (
            <View style={editRemoteTreeStyles.outerView}>
                <Text style={editRemoteTreeStyles.headingText(lightTheme)}>{Strings.messages.EnterSaplingId}</Text>

                <TextInput
                    style={editRemoteTreeStyles.textInput(lightTheme)}
                    placeholder={Strings.labels.SaplingId}
                    placeholderTextColor={'#333'}
                    onChangeText={(text) => setSaplingId(text.trim())}
                    value={saplingId}
                />

                <View style={{ margin: 20, marginHorizontal: 80 }}>
                    <TouchableOpacity style={commonStyles.searchButton} onPress={handlePress}>
                        <Text style={editRemoteTreeStyles.searchButton}>
                            {Strings.buttonLabels.Search}
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>
        )
    }
}

export default EditTreeScreen;
