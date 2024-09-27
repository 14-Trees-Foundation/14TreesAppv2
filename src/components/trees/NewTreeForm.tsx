import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
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
import SelectMenu from '../SelectMenu';
import { useFocusEffect } from '@react-navigation/native';
import UserUpsertForm from './UpsertUserForm';

interface TreeFormInputProps {
    tree: Tree | null,
    changeMode: 'add' | 'edit',
    onSubmit: (data: Tree | CreateTreeRequest, images?: any) => void,
    onCancel: () => void,
    defaultPlot?: any
    saplingID?: string
    defaultLocation?: { latitude: number, longitude: number }
    visit?: Visit
}

export const TreeForm: React.FC<TreeFormInputProps> = ({ saplingID, tree, changeMode, onCancel, onSubmit, defaultPlot, defaultLocation, visit }) => {

    const scrollViewRef = useRef<ScrollView>(null)
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
    const [recentPlantTypes, setRecentPlantTypes] = useState<any[]>([]);
    const recentPlantTypesRef = useRef(recentPlantTypes);

    const [visits, setVisits] = useState<Visit[]>([]);
    const [assignedTo, setAssignedTo] = useState<User | null>(null);
    const [selectedVisit, setSelectedVisit] = useState<Visit | null>(visit ? visit : null);

    const [selectedPlantType, setSelectedPlantType] = useState<any>(null);
    const [plotSearchQuery, setPlotSearchQuery] = useState('');
    const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
    const [plots, setPlots] = useState<Plot[]>([]);
    const [plotsPage, setPlotsPage] = useState(0);
    const [hasMorePlots, setHasMorePlots] = useState(true);

    const [selectedSite, setSelectedSite] = useState<Site | null>(null);
    const [userDetails, setUserDetails] = useState<any>(null);

    const [visitEnabled, setVisitEnabled] = useState(visit ? true : false);

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

    // Update the ref whenever recentPlantTypes changes
    useEffect(() => {
        recentPlantTypesRef.current = recentPlantTypes;
    }, [recentPlantTypes]);

    useFocusEffect(
        useCallback(() => {
            const getRecentPTs = async () => {
                try {
                    const recentPTs = await AsyncStorage.getItem(Constants.recentPlantTypes);
                    if (recentPTs) {
                        setRecentPlantTypes(JSON.parse(recentPTs));
                    }
                } catch (error) {
                    console.error("Error fetching recent plant types:", error);
                }
            };

            getRecentPTs();

            // Cleanup function to save recentPlantTypes if it has changed
            return () => {
                const saveRecentPTs = async () => {
                    try {
                        await AsyncStorage.setItem(
                            Constants.recentPlantTypes,
                            JSON.stringify(recentPlantTypesRef.current)
                        );
                    } catch (error) {
                        console.error("Error saving recent plant types:", error);
                    }
                };
                saveRecentPTs();
            };
        }, [])
    );

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
        if (defaultLocation) {
            setlat(defaultLocation.latitude);
            setlng(defaultLocation.longitude);
        }
    }, [defaultLocation]
    )
    useEffect(() => {
        if (saplingID) {
            setSaplingId(saplingID);
        }
    }, [saplingID])

    useEffect(() => {
        if (tree) {
            const plantType = plantTypes.find((item) => item.id === tree.plant_type_id) || null;
            setSelectedPlantType(plantType)
        }
    }, [tree, plantTypes])

    useEffect(() => {
        const getPlotForPlotId = async (plotId: number) => {
            const daoClient = await DaoClient.authenticate();
            const plot = await daoClient.plots.getPlotByLiveId(plotId);
            setSelectedPlot(plot);
        }
        if (tree) {
            getPlotForPlotId(tree.plot_id);
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
    }, [tree])

    useEffect(() => {
        if (selectedVisit) return;

        const getVisit = async () => {
            if (tree && tree.visit_id) {
                const daoClient = await DaoClient.authenticate();
                const visit = await daoClient.visits.getVisitByLiveId(tree.visit_id)
                setSelectedVisit(visit)
                setVisitEnabled(true);
            }
        }

        getVisit();
    }, [tree, visits])

    useEffect(() => {
        const getDetails = async () => {
            try {
                const userData = await AsyncStorage.getItem(Constants.userDetailsKey)
                if (userData) setUserDetails(JSON.parse(userData));

                if (plantTypes.length === 0) {
                    const daoClient = await DaoClient.authenticate();
                    let plantTypes = await daoClient.plantTypes.getPlantTypes(0, -1);
                    setPlantTypes(plantTypes);
                }
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
        }

        getDetails();
    }, [plantTypes]);

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

        const getPlots = async () => {
            const daoClient = await DaoClient.authenticate();
            let resp = await daoClient.plots.getPlots(plotsPage * 10, 10, undefined, false, selectedSite?.id);
            const newPlots = plotsPage === 0 ? resp : [...plots, ...resp];
    
            // Filter out duplicates based on plot.id
            const uniquePlots = newPlots.filter((plot, index, self) => 
                index === self.findIndex((t) => t.local_id === plot.local_id)
            );
    
            setPlots(uniquePlots);
            setHasMorePlots(resp.length === 10);
        }
        
        getPlots();
    }, [plotsPage, plotSearchQuery, selectedSite])

    useEffect(() => {
        if (plotSearchQuery.length < 1) return;

        const searchPlots = async () => {
            const daoClient = await DaoClient.authenticate();
            let resp = await daoClient.plots.searchPlots(plotSearchQuery, plotsPage * 10, 10, selectedSite?.id);
            const newPlots = plotsPage === 0 ? resp : [...plots, ...resp];
    
            // Filter out duplicates based on plot.id
            const uniquePlots = newPlots.filter((plot, index, self) => 
                index === self.findIndex((t) => t.local_id === plot.local_id)
            );
    
            setPlots(uniquePlots);
            setHasMorePlots(resp.length === 10);
        }
        
        searchPlots();
    }, [plotsPage, plotSearchQuery, selectedSite])

    useEffect(() => {
        const getSelectedSite = async () => {
            const data = await AsyncStorage.getItem(Constants.selectedSite);
            if (data) {
                const site = JSON.parse(data);
                setSelectedSite(site);
            }
        }

        getSelectedSite();
    }, [])

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
            assigned_to: (visitEnabled && assignedTo?.id) ? assignedTo.id : null,
            assigned_to_local: (visitEnabled && assignedTo) ? assignedTo.local_id : null,
            assigned_at: (visitEnabled && assignedTo) ? new Date().toISOString() : null,
            visit_id: (visitEnabled && selectedVisit) ? selectedVisit.id : null,
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

        if (visit) {
            setAssignedTo(null);
            setUserCardImage(null);
            setUserCardImageUri(null);
            setUserTreeImage(null);
            setUserTreeImageUri(null);
            setSaplingId('');
            setSelectedPlantType(null);
            setlat(0);
            setlng(0);
            setImage(null);
            setImageUri(null);
        } else {
            onCancel()
        }
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

    const handleImageLoadOnAdd = () => {
        // only in case of add tree, scroll down to bottom on new image load
        if (changeMode === 'add' && scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd();
        }
    }

    const handlePlantTypeSelect = (pt: any) => {
        setSelectedPlantType(pt);
        if (pt) {
            setRecentPlantTypes(prev => {
                const updated = prev.filter(item => item.id !== pt.id);  // Remove if already exists
                updated.unshift(pt); // Add to the top
                return updated.slice(0, 20); // Limit recent selections to 20 items
            });
        }
    }

    const renderVisitDetails = () => {
        return (
            <View>
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
                    <UserUpsertForm
                        value={assignedTo}
                        onSelect={setAssignedTo}
                    />
                </View>

                <View style={{ width: '100%', marginTop: 10 }}>
                    <ImageSelector
                        label={Strings.labels.UserTreeImage}
                        buttonLabel={Strings.buttonLabels.AddUserTreeImage}
                        onChange={handleUserTreeImageChange}
                        imageUri={userTreeImageUri ? userTreeImageUri : undefined}
                        defaultImageUri='https://drive.google.com/uc?id=1mFig4YN4OFxeDi63taZYQVX6T-eaVHWv'
                    />
                </View>

                <View style={{ width: '100%', marginTop: 10 }}>
                    <ImageSelector
                        label={Strings.labels.UserCardImage}
                        buttonLabel={Strings.buttonLabels.AddUserCardImage}
                        onChange={handleUserCardImageChange}
                        imageUri={userCardImageUri ? userCardImageUri : undefined}
                        defaultImageUri='https://drive.google.com/uc?id=102Pu4dqADhamwDmDI00f4ijiyx1v8ZgA'
                    />
                </View>
            </View>
        )
    }

    return (
        <View style={{ height: "98%", width: "95%" }}>
            <Text style={treeFormStyles.plotSapling}> {changeMode === 'add' ? Strings.messages.AddTree : Strings.messages.EditTree + ': ' + saplingId} </Text>
            <ScrollView
                ref={scrollViewRef}
                keyboardShouldPersistTaps='handled'
                scrollEnabled={true}
                style={{ ...treeFormStyles.detailsContainerOuter, marginHorizontal: 0, }} >
                <View style={{ margin: 4, borderRadius: 10 }}>

                    { visit && renderVisitDetails() }

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
                        <SelectMenu
                            value={selectedPlantType}
                            options={plantTypes}
                            recentOptions={recentPlantTypes}
                            label={Strings.labels.SelectTreeType}
                            onSelect={handlePlantTypeSelect}
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
                            onSearch={(text: string) => { setPlotsPage(0); setPlotSearchQuery(text) }}
                            paginationOptions={{
                                hasMore: hasMorePlots,
                                onPageChange: setPlotsPage,
                                page: plotsPage
                            }}
                        />
                        {validationErrors.plot && <HelperText visible={true} type='error'>Please select a plot</HelperText>}
                    </View>

                    {!defaultLocation && <View style={{ width: '100%', marginTop: 10 }}>
                        <Text style={treeFormStyles.inputLabel}>{Strings.messages.Location}:</Text>
                        <CoordinateSetter
                            inLat={lat}
                            inLng={lng}
                            onSetLat={(item: number) => setlat(item)}
                            onSetLng={(item: number) => setlng(item)}
                            disabled={defaultLocation ? true : false}
                        />
                        {validationErrors.coordinates && <HelperText visible={true} type='error'>Tree coordinates are required</HelperText>}
                    </View>}

                    <View style={{ width: '100%', marginTop: 10 }}>
                        <ImageSelector
                            label={Strings.labels.TreeImage}
                            buttonLabel={Strings.buttonLabels.AddTreeImage}
                            onChange={handleImageChange}
                            imageUri={imageUri ? imageUri : undefined}
                            defaultImageUri='https://drive.google.com/uc?id=18NlBK9AuZQi91LYyQuLHFsfMP1t_n3Xg'
                            onImageLoad={handleImageLoadOnAdd}
                        />
                        {validationErrors.image && <HelperText visible={true} type='error'>Tree Image is required</HelperText>}
                    </View>

                    {!visit && <View style={{ marginTop: 10 }}>
                        <Checkbox.Item
                            label={Strings.messages.AddVisitorDetails}
                            status={visitEnabled ? "checked" : 'unchecked'}
                            onPress={() => { setVisitEnabled(prev => !prev) }}
                            color='#4CAF50'
                        />
                    </View>}

                    {(!visit && visitEnabled) && renderVisitDetails()}

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

