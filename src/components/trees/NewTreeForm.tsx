import { useContext, useEffect, useState } from 'react';
import { ScrollView, Text, ToastAndroid, View } from 'react-native';
import { Strings } from "../../services/Strings";
import { Constants, Utils } from "../../services/Utils";
import { CoordinateSetter } from "../CoordinateSetter";
import { CustomButtonStyles, treeFormStyles } from "../../services/Styles";
import GlobalContext from '../../context/GlobalContext ';
import { Button, TextInput } from 'react-native-paper';
import { DataService } from '../../services/DataService';
import { CreateTreeRequest, Tree } from '../../model/tree';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../../model/user';
import { DaoClient } from '../../services/db/dao';
import Autocomplete from '../AutocompleteModal';
import { ImageSelector } from '../SingleImageSelector';
import { Image } from '../../model/common';

interface TreeFormInputProps {
    tree: Tree | null,
    changeMode: 'add' | 'edit',
    onSubmit: (data: Tree | CreateTreeRequest, images?: any) => void,
    onCancel: () => void,
}

export const TreeForm: React.FC<TreeFormInputProps> = ({ tree, changeMode, onCancel, onSubmit }) => {

    const [saplingId, setSaplingId] = useState('');
    const [lat, setlat] = useState(0);
    const [lng, setlng] = useState(0);

    const [image, setImage] = useState<Image | null>(null);
    const [userTreeImage, setUserTreeImage] = useState<Image | null>(null);
    const [userCardImage, setUserCardImage] = useState<Image | null>(null);

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [userTreeImageUri, setUserTreeImageUri] = useState<string | null>(null);
    const [userCardImageUri, setUserCardImageUri] = useState<string | null>(null);

    const [plantTypes, setPlantTypes] = useState<any[]>([]);
    const [plots, setPlots] = useState<any[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [assignedTo, setAssignedTo] = useState<User | null>(null);

    const [selectedPlantType, setSelectedPlantType] = useState<any>(null);
    const [selectedPlot, setSelectedPlot] = useState<any>(null);
    const [userDetails, setUserDetails] = useState<any>(null);

    const treeStatusList = [
        { value: 'alive', name: 'Alive' },
        { value: 'dead', name: 'Dead' },
        { value: 'lost', name: 'Lost' },
    ];
    const [treeStatus, setTreeStatus] = useState(treeStatusList[0]);

    const { lightTheme } = useContext(GlobalContext);

    useEffect(() => {
        Utils.addTasks();
    }, []);

    useEffect(() => {
        if (tree) {
            setSaplingId(tree.sapling_id);
            if (tree.location) {
                try {
                    let location = JSON.parse(tree.location)
                    if (location.coordinates && location.coordinates.length === 2) {
                        setlat(location.coordinates[0]);
                        setlng(location.coordinates[1]);
                    }
                } catch(err) {
                    console.log(err);
                }
            }
            setTreeStatus(treeStatusList.find((item) => item.value === tree.tree_status) || treeStatusList[0]);

            tree.image && setImageUri(tree.image)
            tree.user_tree_image && setUserTreeImageUri(tree.user_tree_image)
            tree.user_card_image && setUserCardImageUri(tree.user_card_image)
            // if (tree.image) {
            //     fetchImageData(tree.image);
            // } else {
            //     setTimeout(async () => {
            //         const daoClient = await DaoClient.authenticate();
            //         const resp = await daoClient.treeImages.getTreeImagesForSaplingId(tree.sapling_id);
            //         if (resp) {
            //             resp.tree_image && setImageUri(`data:image/jpg;base64,${resp.tree_image.data}`);
            //             resp.user_tree_image && setUserTreeImageUri(`data:image/jpg;base64,${resp.user_tree_image.data}`);
            //             resp.user_card_image && setUserCardImageUri(`data:image/jpg;base64,${resp.user_card_image.data}`);
            //         }
            //     })
            // }

        }
    }, [tree])

    const fetchImageData = async (imageUrl: string) => {
        const data = await DataService.fileURLToBase64(imageUrl);
        data && setImage({ name: imageUrl, data: data });
    }

    useEffect(() => {
        if (tree) {
            const plantType = plantTypes.find((item) => item.id === tree.plant_type_id) || null;
            setSelectedPlantType(plantType)
        }
    }, [tree, plantTypes])

    useEffect(() => {
        if (tree) {
            const plot = plots.find((item) => item.id === tree.plot_id) || null;
            setSelectedPlot(plot)
        }
    }, [tree, plots])

    useEffect(() => {
        if (assignedTo) return;
        setTimeout( async () => {
                if (tree && tree.assigned_to) {
                const daoClient = await DaoClient.authenticate();
                const user = await daoClient.users.getUserByLiveId(tree.assigned_to)
                setAssignedTo(user)
            }
        }, 100)
    }, [tree, users])

    useEffect(() => {
        setTimeout(async () => {
            try {
                const userData = await AsyncStorage.getItem(Constants.userDetailsKey)
                if (userData) setUserDetails(JSON.parse(userData));
                let { treeTypes, plots } = await Utils.getLocalTreeTypesAndPlots();
                if (treeTypes) setPlantTypes(treeTypes);
                if (plots) setPlots(plots);
            } catch (error: any) {
                console.error(error);
                const stackTrace = error.stack;
                const errorLog = {
                    msg: 'happened while trying to fetch tree details from local db(loadDataCallback())',
                    error: JSON.stringify(error),
                    stackTrace: stackTrace,
                };
    
                await Utils.logException(JSON.stringify(errorLog));
            }
        }, 1000);
    }, []);

    const handleUserSearch = (txt: string) => {
        if (txt.length > 0) {
            setTimeout(async () => {
                const daoClient = await DaoClient.authenticate();
                const users = await daoClient.users.searchUsers(txt, 0, 20)
                setUsers(users)
            }, 100)
        }
    }

    const handleSubmit = () => {
        if (!selectedPlantType || !selectedPlot) {
            ToastAndroid.show("Please Select Plant type and plot", ToastAndroid.SHORT)
            return;
        }

        let location = {
            type: 'Point',
            coordinates: [lat, lng]
        }

        const data = {
            sapling_id: saplingId,
            plant_type_id: selectedPlantType.id,
            plot_id: selectedPlot.id,
            planted_by: userDetails?.name,
            tree_status: treeStatus.value,
            assigned_to: assignedTo ? assignedTo.id : null,
            assigned_at: assignedTo ? new Date().toISOString() : null,
        }

        if (changeMode === 'add') {
            let changes = { ...data, location: JSON.stringify(location)  } as CreateTreeRequest;
            onSubmit(changes, {tree_image: image, user_tree_image: userTreeImage, user_card_image: userCardImage})
        }
        else if (tree) {
            let newChanges = { ...tree, ...data, location: JSON.stringify(location) }
            onSubmit(newChanges as Tree, {image: image, user_tree_image: userTreeImage, user_card_image: userCardImage})
        } 

        onCancel()
    }

    return (
        <View style={{ height: "98%" }}>
            <Text style={treeFormStyles.plotSapling}> { changeMode === 'add' ? 'Add Tree' : 'Edit Sapling: ' + saplingId } </Text>
            <ScrollView
                keyboardShouldPersistTaps='handled'
                scrollEnabled={true}
                style={{ ...treeFormStyles.detailsContainerOuter, marginHorizontal: 0, }} >
                <View style={{ margin: 4, borderRadius: 10 }}>

                    <View style={{ marginTop: 10 }}>
                        <TextInput
                            value={saplingId}
                            label={Strings.labels.SaplingId}
                            onChangeText={(text) => { setSaplingId(text) }}
                            mode='outlined'
                        />
                    </View>

                    <View style={{ marginTop: 10 }}>
                        <Autocomplete
                            value={selectedPlantType}
                            options={plantTypes}
                            label={Strings.labels.SelectTreeType}
                            onSelect={(data) => { data && setSelectedPlantType(data); }}
                            valueGetter={(data) => data.name}
                            keyGetter={(data) => data.value}
                            variant='outlined'
                        />
                    </View>

                    <View style={{ marginTop: 10 }}>
                        <Autocomplete
                            value={selectedPlot}
                            options={plots}
                            label={Strings.labels.SelectPlot}
                            onSelect={(data) => { data && setSelectedPlot(data); }}
                            valueGetter={(data) => data.name}
                            keyGetter={(data) => data.value}
                            variant='outlined'
                        />
                    </View>

                    {changeMode === 'edit' && <View style={{ marginTop: 10 }}>
                        <Autocomplete
                            value={treeStatus}
                            options={treeStatusList}
                            label={Strings.labels.SelectTreeStatus}
                            onSelect={(data) => { data && setTreeStatus(data); }}
                            valueGetter={(data) => data.name}
                            keyGetter={(data) => data.value}
                            variant='outlined'
                        />
                    </View>}

                    <View style={{ width: '100%', marginTop: 10 }}>
                        <Text style={ treeFormStyles.inputLabel }>{Strings.messages.Location}:</Text>
                        <CoordinateSetter
                            inLat={lat}
                            inLng={lng}
                            onSetLat={(item: number) => setlat(item)}
                            onSetLng={(item: number) => setlng(item)}
                        />
                    </View>

                    <View style={{ width: '100%', marginTop: 10 }}>
                        <ImageSelector 
                            label='Tree Image'
                            onChange={setImage}
                            imageUri={imageUri ? imageUri : undefined}
                        />
                    </View>

                    <View style={{ marginTop: 10 }}>
                        <Autocomplete
                            value={assignedTo}
                            options={users}
                            label={Strings.labels.SelectUser}
                            onSelect={(data) => { setAssignedTo(data); }}
                            valueGetter={(data) => `${data?.name} (${data?.email})`}
                            keyGetter={(data) => `${data?.local_id}`}
                            onSearch={handleUserSearch}
                            variant='outlined'
                        />
                    </View>

                    <View style={{ width: '100%', marginTop: 10 }}>
                        <ImageSelector 
                            label='User Tree Image'
                            onChange={setUserTreeImage}
                            imageUri={userTreeImageUri ? userTreeImageUri : undefined}
                        />
                    </View>

                    <View style={{ width: '100%', marginTop: 10 }}>
                        <ImageSelector 
                            label='User with Card'
                            onChange={setUserCardImage}
                            imageUri={userCardImageUri ? userCardImageUri : undefined}
                        />
                    </View>


                    <View style={CustomButtonStyles.container}>
                        <View style={CustomButtonStyles.buttonRow}>
                            <View style={CustomButtonStyles.buttonContainer}>
                                <Button
                                    mode="elevated"
                                    buttonColor='#FF6666'
                                    labelStyle={CustomButtonStyles.buttonLabel}
                                    style={CustomButtonStyles.button}
                                    onPress={onCancel}
                                >
                                    {Strings.buttonLabels.cancel}
                                </Button>
                            </View>
                            <View style={CustomButtonStyles.buttonContainer}>
                                <Button
                                    mode='elevated'
                                    onPress={handleSubmit}
                                    buttonColor='#4CAF50'
                                    labelStyle={CustomButtonStyles.buttonLabel}
                                    style={CustomButtonStyles.button}
                                >
                                    {Strings.buttonLabels.Submit}
                                </Button>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

