import { View, BackHandler, ScrollView, SafeAreaView, StyleSheet, ToastAndroid } from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";

import { DaoClient } from "../services/db/dao";
import { TreeForm } from "../components/trees/NewTreeForm";
import TreeCard from "../components/trees/TreeCard";
import TreeInfo from "../components/trees/TreeInfo";
import { TouchableOpacity } from "react-native";
import { CreateTreeRequest, Tree } from "../model/tree";
import { Constants, Utils } from "../services/Utils";
import { useFocusEffect } from "@react-navigation/native";
import { Strings } from "../services/Strings";
import Autocomplete from "../components/AutocompleteModal";
import SearchBar from "../components/Searchbar";
import { AddIconButton } from "../components/FABplusIcon";
import { TreeImageType } from "../model/tree_image";
import TreeImageForm from "../components/trees/TreeImagesForm";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Loading } from "../components/Loading";
import { CreateTreeSnapshotRequest } from "../model/tree_snapshot";
import InternetBanner from "../components/InternetInfo";
import GlobalContext from "../context/GlobalContext ";
import SiteBanner from "../components/SiteBanner";
import { Plot } from "../model/plot";
import { Site } from "../model/sites";
import { syncSingleTree } from "../services/sync/sync";
import MessageModal from "../components/MessageModal";
import CardList from "../components/CardList";

interface TreesInputProps {
    navigation: any
}

const Trees: React.FC<TreesInputProps> = ({ navigation }) => {

    const { langChanged, setPlaySound, uploadInProgress, setUploadInProgress,
        downloadInProgress, currentSyncTime, setCurrentSyncTime,
        syncProgress, setSyncProgress } = useContext(GlobalContext);
    useEffect(() => {
        console.log('langChanged inside Trees: ', langChanged);
    }, [langChanged]);

    const [stateChange, setStateChange] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isImageFormVisible, setIsImageFormVisible] = useState(false);
    const [isInfoModalVisible, setInfoModalVisible] = useState(false);
    const [showSyncInProgress, setShowSyncInProgress] = useState(false);
    const [changeMode, setChangeModel] = useState<'add' | 'edit'>('add');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
    const [trees, setTrees] = useState<Tree[]>([]);
    const [plantTypes, setPlantTypes] = useState<any[]>([]);
    const [plotSearchQuery, setPlotSearchQuery] = useState('');
    const [plotsPage, setPlotsPage] = useState(0);
    const [hasMorePlots, setHasMorePlots] = useState(true);
    const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
    const [plots, setPlots] = useState<Plot[]>([]);
    const [allPlots, setAllPlots] = useState<Plot[]>([]);
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);
    const [userDetails, setUserDetails] = useState<any>(null);
    const [syncTree, setSyncTree] = useState<Tree | null>(null);
    const [treesPage, setTreesPage] = useState(0);
    const [hasMoreTrees, setHasMoreTrees] = useState(true);

    useFocusEffect(
        useCallback(() => {
            setIsFormVisible(false);
            setIsImageFormVisible(false);
            setTreesPage(0);
            setPlotsPage(0);
            setStateChange(prev => prev + 1);
            return () => {
            };
        }, [])
    );

    useEffect(() => {
        const backAction = () => {
            navigation.goBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const userData = await AsyncStorage.getItem(Constants.userDetailsKey)
            if (userData) setUserDetails(JSON.parse(userData));
            const daoClient = await DaoClient.authenticate();
            let plantTypes = await daoClient.plantTypes.getPlantTypes(0, -1);
            setPlantTypes(plantTypes);
        }

        fetchData();
    }, [])

    useEffect(() => {
        if (searchQuery.length !== 0) return;
        
        const getTrees = async () => {
            const localClient = await DaoClient.authenticate();
            let resp = await localClient.trees.getTrees(treesPage * 10, 10, undefined, false, selectedPlot?.id);
    
            for (let i = 0; i < resp.length; i++) {
                const count = await getPendingImagesCountForSapling(resp[i].sapling_id);
                if (count > 0) {
                    console.log(resp[i].sapling_id, count);
                    resp[i].is_uploaded = 0;
                }
            }
    
            const newTrees = treesPage === 0 ? resp : [...trees, ...resp];
    
            // Filter out duplicates based on tree.id
            const uniqueTrees = newTrees.filter((tree, index, self) => 
                index === self.findIndex((t) => t.local_id === tree.local_id)
            );
    
            setTrees(uniqueTrees);
            setHasMoreTrees(resp.length === 10);
            setLoading(false);
        }
    
        getTrees();
    }, [treesPage, searchQuery, stateChange, selectedPlot]);

    useEffect(() => {
        if (searchQuery.length < 1) return;
    
        const timeoutId = setTimeout(() => {
            const searchTrees = async () => {
                const localClient = await DaoClient.authenticate();
                let resp = await localClient.trees.searchTrees(searchQuery, treesPage * 10, 10, selectedPlot?.id);
                for (let i = 0; i < resp.length; i++) {
                    const count = await getPendingImagesCountForSapling(resp[i].sapling_id);
                    if (count > 0) resp[i].is_uploaded = 0;
                }
    
                const newTrees = treesPage === 0 ? resp : [...trees, ...resp];
                const uniqueTrees = newTrees.filter((tree, index, self) => 
                    index === self.findIndex((t) => t.local_id === tree.local_id)
                );
    
                setTrees(uniqueTrees);
                setHasMoreTrees(resp.length === 10);
                setLoading(false);
            }
    
            searchTrees();
        }, 500); // Adjust debounce duration
    
        return () => clearTimeout(timeoutId);
    }, [treesPage, searchQuery, stateChange, selectedPlot]);

    useEffect(() => {
        if (plotSearchQuery.length !== 0) return;
        const getPlots = async () => {
            const daoClient = await DaoClient.authenticate();
            let resp = await daoClient.plots.getPlots(plotsPage * 10, 10, undefined, false, selectedSite?.id);
            if (resp.length < 10) setHasMorePlots(false);
            else setHasMorePlots(true);

            if (plotsPage === 0) setPlots(resp);
            else setPlots([...plots, ...resp]);
        }

        getPlots();
    }, [plotsPage, plotSearchQuery, selectedSite])

    useEffect(() => {
        if (plotSearchQuery.length < 1) return;

        const getPlots = async () => {
            const daoClient = await DaoClient.authenticate();
            let resp = await daoClient.plots.searchPlots(plotSearchQuery, plotsPage * 10, 10, selectedSite?.id);
            if (resp.length < 10) setHasMorePlots(false);
            else setHasMorePlots(true);

            if (plotsPage === 0) setPlots(resp);
            else setPlots([...plots, ...resp]);
        }

        getPlots();

    }, [plotsPage, plotSearchQuery, selectedSite])

    useEffect(() => {
        const getAllPlots = async () => {
            const daoClient = await DaoClient.authenticate();
            let plots = await daoClient.plots.getPlots(0, -1);
            setAllPlots(plots);
        }
        getAllPlots();
    }, [])

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
    }, [stateChange])

    const getPendingImagesCountForSapling = async (saplingId: string) => {
        const daoClient = await DaoClient.authenticate();
        const notSynced = await daoClient.treeSnapshots.countTreeSnapshotImagesForSaplingId(saplingId, false);
        return notSynced.add + notSynced.delete
    }

    const handleSave = (data: Tree | CreateTreeRequest, images?: any) => {
        let hasError = false;

        const saveTree = async () => {
            setLoading(true);
            const localClient = await DaoClient.authenticate();
            if (changeMode === 'add') {
                data = JSON.parse(JSON.stringify(data)) as CreateTreeRequest;
                try {
                    const success = await localClient.trees.createTree(data)
                    if (success) {
                        setPlaySound(true);
                        ToastAndroid.show("Added Tree Locally!", ToastAndroid.SHORT);
                    } else {
                        ToastAndroid.show("Tree with given sapling id already exists!", ToastAndroid.LONG)
                        hasError = true;
                    }
                } catch (err: any) {
                    hasError = true;
                    console.log(err)
                    ToastAndroid.show("Failed to add tree locally!", ToastAndroid.SHORT)
                }
            } else {
                data = JSON.parse(JSON.stringify(data)) as Tree;

                try {
                    await localClient.trees.updateTree(data)
                    setPlaySound(true);
                    ToastAndroid.show("Updated Tree Locally!", ToastAndroid.SHORT)
                } catch (err: any) {
                    hasError = true;
                    ToastAndroid.show("Failed to update tree locally!", ToastAndroid.SHORT)
                }
            };

            const upsertImage = async (type: TreeImageType) => {
                if (images[type]) {
                    try {
                        await localClient.treeImages.upsertTreeImage({
                            name: images[type].name,
                            data: images[type].data,
                            sapling_id: data.sapling_id,
                            type: type,
                            is_active: null,
                            user_id: null,
                        })
                    } catch (err: any) {
                        ToastAndroid.show(`Failed to add ${type.replace('_', ' ')} locally!`, ToastAndroid.SHORT)
                    }
                }
            }

            if (!hasError) {
                upsertImage('tree_image')
                upsertImage('user_card_image')
                upsertImage('user_tree_image')
                ToastAndroid.show("Updated Tree images locally!", ToastAndroid.SHORT)
            }

            setTreesPage(0);
            setStateChange(prev => prev + 1);
        }

        saveTree();

    };

    const handleImagesSave = (images: CreateTreeSnapshotRequest[], deleted: number[], treeStatus: string) => {
        setIsImageFormVisible(false);
        const saveImagesChange = async () => {
            if (selectedTree) {
                const daoClient = await DaoClient.authenticate();
                for (const imageId of deleted) {
                    await daoClient.treeSnapshots.deleteTreeSnapshot(imageId);
                }
                if (images.length > 0) await daoClient.treeSnapshots.insertTreeSnapshots(selectedTree.sapling_id, userDetails.id, images);
                else if (deleted.length === 0) await daoClient.treeSnapshots.insertTreeAdit(selectedTree.sapling_id, userDetails.id, treeStatus)
                setPlaySound(true);
                setTreesPage(0);
                setStateChange(prev => prev + 1);
                ToastAndroid.show("Added Tree images locally!", ToastAndroid.LONG)
            }
        }

        saveImagesChange();
    }

    const handleDelete = () => {
        if (selectedTree) {
            setTimeout(async () => {
                try {
                    const localClient = await DaoClient.authenticate();
                    await localClient.trees.deleteTree(selectedTree.local_id);
                    setPlaySound(true);
                    ToastAndroid.show("Deleted tree locally!", ToastAndroid.SHORT)
                } catch (err: any) {
                    ToastAndroid.show("Failed to delete tree!", ToastAndroid.SHORT)
                }
                setTreesPage(0);
                setStateChange(prev => prev + 1);
            }, 1000)
        }
    }

    const handleSingleTreeSync = async (tree: Tree) => {
        if (uploadInProgress) {
            setShowSyncInProgress(true);
            return;
        }

        const syncStartTime = new Date().toISOString();
        setSyncTree(tree);
        setUploadInProgress(true);
        setCurrentSyncTime(syncStartTime);
        setSyncProgress(0);

        await syncSingleTree(tree.local_id, tree.sapling_id, syncStartTime);
        setTreesPage(0);
        setStateChange(prev => prev + 1);

        setSyncTree(null);
        setSyncProgress(1);
        setUploadInProgress(false);
        setCurrentSyncTime(null);
    }

    const renderTreeItem = (tree: Tree, index: number) => {
        return (
            <View style={{ width: '100%', paddingHorizontal: 10 }} key={index}>
                <TouchableOpacity style={{ width: '100%', alignItems: 'center' }} activeOpacity={0.91} onPress={() => {
                    setSelectedTree(tree);
                    setInfoModalVisible(true);
                }}>
                    <TreeCard
                        tree={tree}
                        plantTypeName={plantTypes.find(plantType => plantType.id === tree.plant_type_id)?.name || ''}
                        plotName={allPlots.find(plot => plot.id === tree.plot_id)?.name || ''}
                        onEdit={() => { setSelectedTree(tree); setChangeModel('edit'); setIsFormVisible(true); }}
                        onAudit={() => { setSelectedTree(tree); setIsImageFormVisible(true); }}
                        onTreeMap={() => {
                            navigation.navigate(
                                Strings.screenNames.getString('Map', Strings.english),
                                {
                                    selectedPlot: selectedPlot ? selectedPlot : allPlots.find(plot => plot.id === tree.plot_id),
                                    sapling: tree.sapling_id
                                },
                            )
                        }}
                        onSync={() => handleSingleTreeSync(tree)}
                        currentTreeSync={tree.local_id === syncTree?.local_id}
                    />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <InternetBanner />
            <SiteBanner />
            <SafeAreaView style={styles.safeArea}>
                {!(isFormVisible || isImageFormVisible) && <View style={{ height: 'auto', alignItems: 'center', width: "96%" }}>
                    <View style={{ width: '100%', flexGrow: 1, marginTop: 15 }}>
                        <Autocomplete
                            label={selectedPlot ? Strings.labels.SelectedPlot : Strings.labels.SelectPlot}
                            options={plots}
                            value={selectedPlot}
                            onSelect={setSelectedPlot}
                            valueGetter={(data) => data.name}
                            keyGetter={(data) => data.id}
                            variant="outlined"
                            boldSelection
                            onSearch={(text: string) => { setPlotsPage(0); setPlotSearchQuery(text) }}
                            paginationOptions={{
                                hasMore: hasMorePlots,
                                onPageChange: setPlotsPage,
                                page: plotsPage
                            }}
                        />
                    </View>
                </View>}
                {!(isFormVisible || isImageFormVisible) && <View style={styles.header}>
                    <SearchBar query={searchQuery} onChange={(text: string) => { setTreesPage(0); setSearchQuery(text) }} />
                </View>}
                {!(isFormVisible || isImageFormVisible) && <CardList 
                    data={trees}
                    renderItem={renderTreeItem}
                    pagination
                    onEndReached={() => { setTreesPage(treesPage + 1) }}
                    hasMore={hasMoreTrees}
                />}
                {!(isFormVisible || isImageFormVisible) && <AddIconButton onClick={() => {
                    setIsFormVisible(true);
                    setSelectedTree(null);
                    setChangeModel('add');
                }} />}

                {isFormVisible && <TreeForm
                    changeMode={changeMode}
                    onCancel={() => setIsFormVisible(false)}
                    onSubmit={handleSave}
                    tree={selectedTree}
                    defaultPlot={selectedPlot}
                />}

                {isImageFormVisible && selectedTree && <TreeImageForm
                    onCancel={() => setIsImageFormVisible(false)}
                    onSubmit={handleImagesSave}
                    saplingId={selectedTree.sapling_id}
                    plantTypes={plantTypes}
                />}

                {selectedTree && <TreeInfo
                    isVisible={isInfoModalVisible}
                    plantType={plantTypes.find(plantType => plantType.id === selectedTree.plant_type_id)?.name || ''}
                    plot={allPlots.find(plot => plot.id === selectedTree.plot_id)?.name || ''}
                    onClose={() => { setInfoModalVisible(false) }}
                    onDelete={handleDelete}
                    tree={selectedTree}
                />}

                <MessageModal
                    visible={showSyncInProgress}
                    text={Strings.alertMessages.SyncInProgress}
                    onClose={() => setShowSyncInProgress(false)}
                />

                <Loading loading={loading} />
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        width: '100%',
        alignItems: 'center'
    },
    header: {
        marginVertical: 10,
        alignItems: 'center',
        height: 50,
        width: '95%'
    },
    scrollView: {
        flex: 1,
        width: '100%',
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
});

export default Trees;