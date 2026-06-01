import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { Strings } from "../../services/Strings";
import { CustomButtonStyles, treeFormStyles } from "../../services/Styles";
import { Button, Checkbox, SegmentedButtons } from 'react-native-paper';
import ImagesView from '../ImagesView';
import ImageOptions from '../ImageOptionsModal';
import { Image, ImageSource } from '../../model/common';
import { DaoClient } from '../../services/db/dao';
import { DatePicker } from '../DatePicker';
import { Constants, getHumanReadableDate } from '../../services/Utils';
import { CreateTreeSnapshotRequest } from '../../model/tree_snapshot';
import { Tree } from '../../model/tree';
import SelectMenu from '../SelectMenu';
import Autocomplete from '../AutocompleteModal';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plot, locationPlotToPlot } from '../../model/plot';
import { Site } from '../../model/sites';

const getImageDescription = (imageDate: string, treeStatus: string) => {
    const treeStatusMap: any = {
        'healthy': 'Healthy',
        'diseased': 'Diseased',
        'dead': 'Dead',
        'lost': 'Lost',
    }
    return `${getHumanReadableDate(imageDate)} (${treeStatusMap[treeStatus]})`
}

interface TreeImageFormInputProps {
    saplingId: string,
    plantTypes: any[],
    onSubmit: (images: CreateTreeSnapshotRequest[], deleted: number[], treeStatus: string) => void,
    onCancel: () => void,
    lockedPlot?: Plot,
}

const TreeImageForm: React.FC<TreeImageFormInputProps> = ({ saplingId, plantTypes, onCancel, onSubmit, lockedPlot }) => {

    const [images, setImages] = useState<(ImageSource | CreateTreeSnapshotRequest)[]>([]);
    const [deletedImages, setDeletedImages] = useState<number[]>([]);
    const [date, setDate] = useState(new Date());
    const [treeStatus, setTreeStatus] = useState('healthy');
    const [dateEnabled, setDateEnabled] = useState(false);
    const [tree, setTree] = useState<Tree | null>(null)

    const [selectedPlantType, setSelectedPlantType] = useState<any>(null);
    const [recentPlantTypes, setRecentPlantTypes] = useState<any[]>([]);
    const recentPlantTypesRef = useRef(recentPlantTypes);

    const [plotSearchQuery, setPlotSearchQuery] = useState('');
    const [selectedPlot, setSelectedPlot] = useState<Plot | null>(lockedPlot ?? null);
    const [plots, setPlots] = useState<Plot[]>([]);
    const [plotsPage, setPlotsPage] = useState(0);
    const [hasMorePlots, setHasMorePlots] = useState(true);
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);

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
        const setTreeSnapshots = async () => { 
            const daoClient = await DaoClient.authenticate();
            const treeSnapshots = await  daoClient.treeSnapshots.getTreeSnapshotsBySaplingId(saplingId);

            const uris = treeSnapshots.map(treeImage => {
                const description = getImageDescription(treeImage.created_at, treeImage.tree_status);
                let imageUri = treeImage.data ? `data:image/jpg;base64,${treeImage.data}`: undefined;
                if (treeImage.image) imageUri = treeImage.image;

                return {
                    uri: imageUri, 
                    description: description,
                    id: treeImage.local_id,
                    tree_status: treeImage.tree_status,
                    image_date: treeImage.image_date
                };
            })

            setImages(prev => [...prev, ...uris])
        }

        const setTreeForSapling = async () => {
            const daoClient = await DaoClient.authenticate();
            const trees = await daoClient.trees.getTreesBySaplings([saplingId]);
            if (trees.length === 1) {
                setTree(trees[0])
            }
        }
        
        if (saplingId !== '') {
            setTreeSnapshots();
            setTreeForSapling();
        }

    }, [saplingId])

    useEffect(() => {
        if (lockedPlot) return;
        const getPlotForPlotId = async (plotId: number) => {
            const daoClient = await DaoClient.authenticate();
            const locationPlot = await daoClient.locationPlots.getByOldPlotId(plotId);
            if (locationPlot) { setSelectedPlot(locationPlotToPlot(locationPlot)); return; }
            const plot = await daoClient.plots.getPlotByLiveId(plotId);
            setSelectedPlot(plot);
        }
        if (tree) {
            getPlotForPlotId(tree.plot_id);
        }
    }, [tree])

    useEffect(() => {
        if (tree) {
            const pt = plantTypes.find(item => item.id === tree.plant_type_id);
            if (pt) setSelectedPlantType(pt);
        }
    }, [tree, plantTypes])

    useEffect(() => {
        const getSelectedSite = async () => {
            const data = await AsyncStorage.getItem(Constants.selectedSite);
            if (data) {
                const site = JSON.parse(data);
                setSelectedSite(site);
            } else {
                setSelectedSite(null);
            }
        }

        getSelectedSite();
    }, [])

    useEffect(() => {
        if (lockedPlot) return;
        if (plotSearchQuery.length !== 0) return;
        const getPlots = async () => {
            const daoClient = await DaoClient.authenticate();
            if (selectedSite?.id) {
                const locationPlots = await daoClient.locationPlots.getLocationPlots(selectedSite.id);
                if (locationPlots.length > 0) {
                    setPlots(locationPlots.map(locationPlotToPlot));
                    setHasMorePlots(false);
                    return;
                }
            }
            let resp = await daoClient.plots.getPlots(plotsPage * 10, 10, undefined, false, undefined);
            if (resp.length < 10) setHasMorePlots(false);
            else setHasMorePlots(true);
            if (plotsPage === 0) setPlots(resp);
            else setPlots([...plots, ...resp]);
        }

        getPlots();
    }, [plotsPage, plotSearchQuery, selectedSite])

    useEffect(() => {
        if (lockedPlot) return;
        if (plotSearchQuery.length < 1) return;

        const getPlots = async () => {
            const daoClient = await DaoClient.authenticate();
            const locationPlots = await daoClient.locationPlots.searchLocationPlots(plotSearchQuery, selectedSite?.id);
            if (locationPlots.length > 0) {
                setPlots(locationPlots.map(locationPlotToPlot));
                setHasMorePlots(false);
                return;
            }
            let resp = await daoClient.plots.searchPlots(plotSearchQuery, plotsPage * 10, 10, undefined);
            if (resp.length < 10) setHasMorePlots(false);
            else setHasMorePlots(true);
            if (plotsPage === 0) setPlots(resp);
            else setPlots([...plots, ...resp]);
        }

        getPlots();

    }, [plotsPage, plotSearchQuery, selectedSite])

    const handleSubmit = () => {
        const updateTree = async (data: Tree) => {
            const daoClient = await DaoClient.authenticate();
            await daoClient.trees.updateTree(data)
            ToastAndroid.show('Tree details updated!', ToastAndroid.LONG);
        }

        if (tree) {
            let isChanged = false;
            if ( selectedPlot?.id && selectedPlot.id !== tree.plot_id) {
                isChanged = true;
                tree.plot_id = selectedPlot.id
            }

            if (selectedPlantType?.id && selectedPlantType.id !== tree.plant_type_id) {
                isChanged = true;
                tree.plant_type_id = selectedPlantType.id
            }

            if (isChanged) updateTree(tree);
        }

        const newImages: CreateTreeSnapshotRequest[] = [];
        images.forEach(image => {
            let imageObj: any = { ...image }
            if (imageObj.id === undefined) {
                newImages.push({ 
                    name: imageObj.name, 
                    data: imageObj.data,
                    tree_status: imageObj.tree_status,
                    image_date: imageObj.image_date,
                });
            }
        });
        if ((treeStatus === 'healthy' || treeStatus === 'diseased') && (newImages.length === 0 && deletedImages.length === 0)) {
            ToastAndroid.show('Images are required for tree audit!', ToastAndroid.LONG);
            return;
        }
        onSubmit(newImages, deletedImages, treeStatus);
    }

    const handleImageChange = (image?: Image) => {
        const imageDate = dateEnabled ? date.toISOString() : new Date().toISOString();
        if (image) {
            const description = getImageDescription(imageDate, treeStatus);
            const uri = `data:image/jpg;base64,${image.data}`
            setImages(prev => [...prev, { ...image, description: description, uri: uri, tree_status: treeStatus, image_date: imageDate }])
        }
    }

    const handleImageDelete = (index: number) => {
        index = images.length - 1 - index; // since we have passed reversed array to component
        const image = images[index];
        if (image) {
            const obj: ImageSource = JSON.parse(JSON.stringify(image))
            if (obj.id) {
                const id = obj.id
                setDeletedImages(prev => [...prev, id])
            }
        }

        setImages([...images.slice(0, index), ...images.slice(index + 1)])
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

    return (
        <View style={{ flex: 1, height: "97%", width: '100%', flexGrow: 1 }}>
            <Text style={styles.saplingHeaderKey}>{Strings.messages.Sapling + ": "}<Text style={styles.saplingHeaderValue}>{saplingId}</Text></Text>
            <ScrollView
                keyboardShouldPersistTaps='handled'
                scrollEnabled={true}
                style={{ ...treeFormStyles.detailsContainerOuter, marginHorizontal: 10, }} >
                <View style={{ margin: 4, borderRadius: 10 }}>

                    <View style={{ marginTop: 10, flexGrow: 1 }}>
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
                    </View>

                    <View style={{ marginTop: 10, flexGrow: 1 }}>
                        <Autocomplete
                            value={selectedPlot}
                            options={plots}
                            label={selectedPlot ? Strings.labels.SelectedPlot : Strings.labels.SelectPlot}
                            onSelect={(data) => { setSelectedPlot(data); }}
                            valueGetter={(data) => data.name}
                            keyGetter={(data) => data.id}
                            variant='outlined'
                            disabled={!!lockedPlot}
                            onSearch={(text: string) => { setPlotsPage(0); setPlotSearchQuery(text) }}
                            paginationOptions={{
                                hasMore: hasMorePlots,
                                onPageChange: setPlotsPage,
                                page: plotsPage
                            }}
                        />
                    </View>

                    <View style={{ marginTop: 10, flexGrow: 1 }}>
                        <ImagesView
                            title={images.length > 0 ? Strings.messages.TreeImages : Strings.messages.NoImages}
                            images={ images.map(item => item).reverse() }
                            onDelete={handleImageDelete}
                        />
                    </View>

                    <View style={{ marginTop: 10, flexGrow: 1 }}>
                        <Text style={{ color: 'black', paddingLeft: 10, fontSize: 16, marginBottom: 5 }}>{Strings.messages.WhatIsTreeStatus}</Text>
                        <SegmentedButtons
                            value={treeStatus}
                            onValueChange={setTreeStatus}
                            buttons={[
                                { value: 'healthy', label: 'Healthy', style: { backgroundColor: treeStatus === 'healthy' ? 'lightgreen' : 'white' } },
                                { value: 'diseased', label: 'Diseased', style: { backgroundColor: treeStatus === 'diseased' ? 'lightgreen' : 'white' } },
                                { value: 'dead', label: 'Dead', style: { backgroundColor: treeStatus === 'dead' ? 'lightgreen' : 'white' } },
                                { value: 'lost', label: 'Lost', style: { backgroundColor: treeStatus === 'lost' ? 'lightgreen' : 'white' } },
                            ]}
                        />
                    </View>

                    {/* {(treeStatus === 'healthy' || treeStatus === 'diseased') && <View style={{ marginTop: 10 }}>
                        <Checkbox.Item
                            label={Strings.messages.ImageDate}
                            status={dateEnabled ? "checked" : 'unchecked'}
                            onPress={() => { setDateEnabled(prev => !prev) }}
                            color='#4CAF50'
                        />
                    </View>}
                    {dateEnabled && <View style={{ marginTop: 10, flexGrow: 1 }}>
                        <DatePicker
                            label={Strings.labels.ImageDate}
                            value={date}
                            onChange={setDate}
                        />
                    </View>} */}
                    
                    {(treeStatus !== 'lost') && <ImageOptions buttonLabel={Strings.buttonLabels.AddNewImage} onChange={handleImageChange} multiple/>}

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

const styles = StyleSheet.create({
   saplingHeaderKey: {
    color: '#113160',
    fontFamily: 'Inter-Regular',
    fontSize: 20,
    textAlign: 'left',
    justifyContent: 'center',
    marginTop: 20,
    fontWeight: 'bold',
    padding: 5,
    marginHorizontal: 15
   },
   saplingHeaderValue: {
    color: '#113160',
    fontFamily: 'Inter-Regular',
    fontSize: 20,
    textAlign: 'center',
    justifyContent: 'center',
    marginTop: 25,
    fontWeight: '300',
    padding: 5
   } 
})

export default TreeImageForm;