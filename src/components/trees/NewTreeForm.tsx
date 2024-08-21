import { useEffect, useState } from 'react';
import { ScrollView, Text, ToastAndroid, View } from 'react-native';
import { Strings } from "../../services/Strings";
import { Constants, Utils } from "../../services/Utils";
import { CoordinateSetter } from "../CoordinateSetter";
import { CustomButtonStyles, treeFormStyles } from "../../services/Styles";
import { Button, Checkbox, HelperText, TextInput } from 'react-native-paper';
import { CreateTreeRequest, Tree } from '../../model/tree';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../../model/user';
import { DaoClient } from '../../services/db/dao';
import Autocomplete from '../AutocompleteModal';
import { ImageSelector } from '../SingleImageSelector';
import { Image } from '../../model/common';
import { Visit } from '../../model/visits';
import { Plot } from '../../model/plot';
import { Site } from '../../model/sites';

interface TreeFormInputProps {
    tree: Tree | null,
    changeMode: 'add' | 'edit',
    onSubmit: (data: Tree | CreateTreeRequest, images?: any) => void,
    onCancel: () => void,
    defaultPlot?: any
}

export const TreeForm: React.FC<TreeFormInputProps> = ({ tree, changeMode, onCancel, onSubmit, defaultPlot }) => {

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
    const [users, setUsers] = useState<User[]>([]);
    const [visits, setVisits] = useState<Visit[]>([]);
    const [assignedTo, setAssignedTo] = useState<User | null>(null);
    const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);

    const [selectedPlantType, setSelectedPlantType] = useState<any>(null);
    const [plotSearchQuery, setPlotSearchQuery] = useState('');
    const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
    const [plots, setPlots] = useState<Plot[]>([]);
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);
    const [userDetails, setUserDetails] = useState<any>(null);

    const [visitEnabled, setVisitEnabled] = useState(false);

    const [validationErrors, setValidationErrors] = useState({
        saplingId: false,
        saplingExists: false,
        plantType: false,
        plot: false,
        image: false,
        status: false,
        coordinates: false,
    })

    const resetValidationErrors = () => {
        setValidationErrors({
            saplingId: false,
            saplingExists: false,
            plantType: false,
            plot: false,
            image: false,
            status: false,
            coordinates: false,
        })
    }

    const treeStatusList = [
        { value: 'healthy', name: 'Healthy' },
        { value: 'diseased', name: 'Diseased' },
        { value: 'dead', name: 'Dead' },
    ];
    const [treeStatus, setTreeStatus] = useState<any>(treeStatusList[0]);

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
                } catch (err) {
                    console.log(err);
                }
            }
            setTreeStatus(treeStatusList.find((item) => item.value === tree.tree_status) || treeStatusList[0]);

            tree.image && setImageUri(tree.image)
            tree.user_tree_image && setUserTreeImageUri(tree.user_tree_image)
            tree.user_card_image && setUserCardImageUri(tree.user_card_image)
            setTimeout(async () => {
                const daoClient = await DaoClient.authenticate();
                const resp = await daoClient.treeImages.getTreeImagesForSaplingId(tree.sapling_id);
                if (resp) {
                    resp.tree_image && setImageUri(`data:image/jpg;base64,${resp.tree_image.data}`);
                    resp.user_tree_image && setUserTreeImageUri(`data:image/jpg;base64,${resp.user_tree_image.data}`);
                    resp.user_card_image && setUserCardImageUri(`data:image/jpg;base64,${resp.user_card_image.data}`);
                }
            })
        }
    }, [tree])

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
        changeMode === 'add' && defaultPlot && setSelectedPlot(defaultPlot);
    }, [defaultPlot])

    useEffect(() => {
        if (assignedTo) return;
        setTimeout(async () => {
            if (tree && tree.assigned_to) {
                const daoClient = await DaoClient.authenticate();
                const user = await daoClient.users.getUserByLiveId(tree.assigned_to)
                setAssignedTo(user)
                setVisitEnabled(true);
            }
        }, 100)
    }, [tree, users])

    useEffect(() => {
        if (selectedVisit) return;
        setTimeout(async () => {
            if (tree && tree.visit_id) {
                const daoClient = await DaoClient.authenticate();
                const visit = await daoClient.visits.getVisitByLiveId(tree.visit_id)
                setSelectedVisit(visit)
                setVisitEnabled(true);
            }
        }, 100)
    }, [tree, visits])

    useEffect(() => {
        setTimeout(async () => {
            try {
                const userData = await AsyncStorage.getItem(Constants.userDetailsKey)
                if (userData) setUserDetails(JSON.parse(userData));
                let { treeTypes } = await Utils.getLocalTreeTypesAndPlots();
                if (treeTypes) setPlantTypes(treeTypes);
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

    useEffect(() => {
        setTimeout(async () => {
            if (saplingId.length > 0 && changeMode === 'add') {
                const daoClient = await DaoClient.authenticate();
                const exists = await daoClient.trees.checkIfSaplingExists(saplingId);
                setValidationErrors(prev => ({ ...prev, saplingExists: exists }))
            } else if (saplingId.length === 0) {
                setValidationErrors(prev => ({ ...prev, saplingExists: false }))
            }
        }, 10)
    }, [saplingId])

    useEffect(() => {
        if (plotSearchQuery.length !== 0) return;
        setTimeout(async () => {
            const daoClient = await DaoClient.authenticate();
            let resp = await daoClient.plots.getPlots(0, 100, undefined, false, selectedSite?.id);
            setPlots(resp)
        }, 100)
    }, [plotSearchQuery, selectedSite])

    useEffect(() => {
        if (plotSearchQuery.length < 1) return;
        setTimeout(async () => {
            const daoClient = await DaoClient.authenticate();
            let plots = await daoClient.plots.searchPlots(plotSearchQuery, 0, 100, selectedSite?.id);
            setPlots(plots);
        }, 100)
    }, [plotSearchQuery, selectedSite])

    useEffect(() => {
        setTimeout(async () => {

            const daoClient = await DaoClient.authenticate();
            const siteId = await AsyncStorage.getItem(Constants.selectedSiteId)
            if (siteId) {
                const site = await daoClient.sites.getSiteByLiveId(parseInt(siteId));
                setSelectedSite(site);
            }
        }, 10)
    }, [])

    const handleUserSearch = (txt: string) => {
        if (txt.length > 0) {
            setTimeout(async () => {
                const daoClient = await DaoClient.authenticate();
                const users = await daoClient.users.searchUsers(txt, 0, 20)
                setUsers(users)
            }, 100)
        }
    }

    const handleVisitSearch = (txt: string) => {
        if (txt.length > 0) {
            setTimeout(async () => {
                const daoClient = await DaoClient.authenticate();
                const visits = await daoClient.visits.searchVisits(txt, 0, 20)
                setVisits(visits)
            }, 100)
        }
    }

    useEffect(() => {
        handleUserSearch(' ');
        handleVisitSearch(' ');
    }, [])

    const handleSubmit = () => {
        resetValidationErrors();
        if (!selectedPlot) setValidationErrors(prev => ({ ...prev, plot: true }))
        if (!selectedPlantType) setValidationErrors(prev => ({ ...prev, plantType: true }))
        if (!treeStatus) setValidationErrors(prev => ({ ...prev, status: true }))
        if (!imageUri) setValidationErrors(prev => ({ ...prev, image: true }))
        if (saplingId === '') setValidationErrors(prev => ({ ...prev, saplingId: true }))
        if (lat === 0) setValidationErrors(prev => ({ ...prev, coordinates: true }))

        if (!selectedPlot || !selectedPlantType || !treeStatus || !imageUri || saplingId === '' || lat === 0 || validationErrors.saplingExists) return;

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
            assigned_to: ( visitEnabled && assignedTo) ? assignedTo.id : null,
            assigned_at: ( visitEnabled && assignedTo) ? new Date().toISOString() : null,
            visit_id: ( visitEnabled && selectedVisit) ? selectedVisit.id : null,
        }

        const imageData = { 
            tree_image: image, 
            user_tree_image: visitEnabled ? userTreeImage : null, 
            user_card_image: visitEnabled ? userCardImage : null,
        }

        if (changeMode === 'add') {
            let changes = { ...data, location: JSON.stringify(location) } as CreateTreeRequest;
            onSubmit(changes, imageData)
        }
        else if (tree) {
            let newChanges = { ...tree, ...data, location: JSON.stringify(location) }
            onSubmit(newChanges as Tree, imageData)
        }

        onCancel()
    }

    const handleImageChange = (image: Image | null) => {
        setImage(image);
        if (image) setImageUri(`data:image/jpg;base64,${image.data}`)
        else setImageUri(null);
    }

    const handleUserTreeImageChange = (image: Image | null) => {
        setUserTreeImage(image);
        if (image) setUserTreeImageUri(`data:image/jpg;base64,${image.data}`)
        else setUserTreeImageUri(null);
    }
    const handleUserCardImageChange = (image: Image | null) => {
        setUserCardImage(image);
        if (image) setUserCardImageUri(`data:image/jpg;base64,${image.data}`)
        else setUserCardImageUri(null);
    }

    return (
        <View style={{ height: "98%" }}>
            <Text style={treeFormStyles.plotSapling}> {changeMode === 'add' ? Strings.messages.AddTree : Strings.messages.EditTree + ': ' + saplingId} </Text>
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
                        {validationErrors.saplingId && <HelperText visible={true} type='error'>Please Enter Sapling Id</HelperText>}
                        {validationErrors.saplingExists && <HelperText visible={true} type='error'>Sapling Id already exists</HelperText>}
                    </View>

                    <View style={{ marginTop: 10 }}>
                        <Autocomplete
                            value={selectedPlantType}
                            options={plantTypes}
                            label={Strings.labels.SelectTreeType}
                            onSelect={(data) => { setSelectedPlantType(data); }}
                            valueGetter={(data) => data.name}
                            keyGetter={(data) => data.value}
                            variant='outlined'
                        />
                        {validationErrors.plantType && <HelperText visible={true} type='error'>Please select a plant type</HelperText>}
                    </View>

                    <View style={{ marginTop: 10 }}>
                        <Autocomplete
                            value={selectedPlot}
                            options={plots}
                            label={selectedPlot ? Strings.labels.SelectedPlot : Strings.labels.SelectPlot}
                            onSelect={(data) => { setSelectedPlot(data); }}
                            valueGetter={(data) => data.name}
                            keyGetter={(data) => data.id}
                            variant='outlined'
                            onSearch={setPlotSearchQuery}
                        />
                        {validationErrors.plot && <HelperText visible={true} type='error'>Please select a plot</HelperText>}
                    </View>

                    {changeMode === 'edit' && <View style={{ marginTop: 10 }}>
                        <Autocomplete
                            value={treeStatus}
                            options={treeStatusList}
                            label={Strings.labels.SelectTreeStatus}
                            onSelect={(data) => { setTreeStatus(data); }}
                            valueGetter={(data) => data.name}
                            keyGetter={(data) => data.value}
                            variant='outlined'
                        />
                        {validationErrors.status && <HelperText visible={true} type='error'>Please select tree status</HelperText>}
                    </View>}

                    <View style={{ width: '100%', marginTop: 10 }}>
                        <Text style={treeFormStyles.inputLabel}>{Strings.messages.Location}:</Text>
                        <CoordinateSetter
                            inLat={lat}
                            inLng={lng}
                            onSetLat={(item: number) => setlat(item)}
                            onSetLng={(item: number) => setlng(item)}
                        />
                        {validationErrors.coordinates && <HelperText visible={true} type='error'>Tree coordinates are required</HelperText>}
                    </View>

                    <View style={{ width: '100%', marginTop: 10 }}>
                        <ImageSelector
                            label={Strings.buttonLabels.TreeImage}
                            onChange={handleImageChange}
                            imageUri={imageUri ? imageUri : undefined}
                        />
                        {validationErrors.image && <HelperText visible={true} type='error'>Tree Image is required</HelperText>}
                    </View>

                    <View style={{ marginTop: 10 }}>
                        <Checkbox.Item
                            label={Strings.messages.AddVisitorDetails}
                            status={visitEnabled ? "checked" : 'unchecked'}
                            onPress={() => { setVisitEnabled(prev => !prev) }}
                            color='#4CAF50'
                        />
                    </View>

                    {visitEnabled && <View>
                        <View style={{ marginTop: 10 }}>
                            <Autocomplete
                                value={selectedVisit}
                                options={visits}
                                label={Strings.labels.SelectVisit}
                                onSelect={(data) => { setSelectedVisit(data); }}
                                valueGetter={(data) => `${data?.visit_name}`}
                                keyGetter={(data) => `${data?.local_id}`}
                                onSearch={handleVisitSearch}
                                variant='outlined'
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
                                label={Strings.buttonLabels.UserTreeImage}
                                onChange={handleUserTreeImageChange}
                                imageUri={userTreeImageUri ? userTreeImageUri : undefined}
                            />
                        </View>

                        <View style={{ width: '100%', marginTop: 10 }}>
                            <ImageSelector
                                label={Strings.buttonLabels.UserCardImage}
                                onChange={handleUserCardImageChange}
                                imageUri={userCardImageUri ? userCardImageUri : undefined}
                            />
                        </View>
                    </View>}


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

