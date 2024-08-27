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

interface TreesInputProps {
    navigation: any
}

const Trees: React.FC<TreesInputProps> = ({ navigation }) => {

    const { langChanged, setPlaySound } = useContext(GlobalContext);
    useEffect(() => {
        console.log('langChanged inside Trees: ', langChanged);
    }, [langChanged]);

    const [stateChange, setStateChange] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isImageFormVisible, setIsImageFormVisible] = useState(false);
    const [isInfoModalVisible, setInfoModalVisible] = useState(false);
    const [changeMode, setChangeModel] = useState<'add' | 'edit'>('add');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
    const [trees, setTrees] = useState<Tree[]>([]);
    const [plantTypes, setPlantTypes] = useState<any[]>([]);
    const [plotSearchQuery, setPlotSearchQuery] = useState('');
    const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
    const [plots, setPlots] = useState<Plot[]>([]);
    const [allPlots, setAllPlots] = useState<Plot[]>([]);
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);
    const [userDetails, setUserDetails] = useState<any>(null);

    let localClient: DaoClient;
    DaoClient.authenticate().then((client) => { localClient = client; });

    useFocusEffect(
        useCallback(() => {
            setIsFormVisible(false);
            setIsImageFormVisible(false);
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
        setTimeout(async () => {
            const userData = await AsyncStorage.getItem(Constants.userDetailsKey)
            if (userData) setUserDetails(JSON.parse(userData));
            const { treeTypes } = await Utils.getLocalTreeTypesAndPlots();

            treeTypes && setPlantTypes(treeTypes);
        })
    }, [])

    useEffect(() => {
        if (searchQuery.length !== 0) return;
        setTimeout(async () => {
            let resp = await localClient.trees.getTrees(0, 100, undefined, false, selectedPlot?.id);
            setTrees(resp)
            setLoading(false);
        }, 1000)
    }, [searchQuery, stateChange, selectedPlot])

    useEffect(() => {
        if (searchQuery.length < 1) return;
        setTimeout(async () => {
            let trees = await localClient.trees.searchTrees(searchQuery, 0, 100, selectedPlot?.id);
            setTrees(trees);
            setLoading(false);
        }, 1000)
    }, [searchQuery, stateChange, selectedPlot])

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
        const getAllPlots = async () => {
            const daoClient = await DaoClient.authenticate();
            let plots = await daoClient.plots.getPlots(0, -1);
            setAllPlots(plots);
        }
        getAllPlots();
    }, [])

    useEffect(() => {
        setTimeout(async () => {

            const daoClient = await DaoClient.authenticate();
            const siteId = await AsyncStorage.getItem(Constants.selectedSiteId)
            if (siteId) {
                const site = await daoClient.sites.getSiteByLiveId(parseInt(siteId));
                setSelectedSite(site);
            } else {
                setSelectedSite(null);
            }
        }, 10)
    }, [stateChange])

    const handleSave = (data: Tree | CreateTreeRequest, images?: any) => {
        let hasError = false;
        setTimeout(async () => {
            setLoading(true);
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

            setStateChange(prev => prev + 1);
        }, 1000)

    };

    const handleImagesSave = (images: CreateTreeSnapshotRequest[], deleted: number[]) => {
        setIsImageFormVisible(false);
        setTimeout(async () => {
            if (images.length > 0 && selectedTree) {
                const daoClient = await DaoClient.authenticate();
                for (const imageId of deleted) {
                    await daoClient.treeSnapshots.deleteTreeSnapshot(imageId);
                }
                await daoClient.treeSnapshots.insertTreeSnapshots(selectedTree.sapling_id, userDetails.id, images)
                setPlaySound(true);
                ToastAndroid.show("Added Tree images locally!", ToastAndroid.LONG)
            }
        }, 10)
    }

    const handleDelete = () => {
        if (selectedTree) {
            setTimeout(async () => {
                try {
                    await localClient.trees.deleteTree(selectedTree.local_id);
                    setPlaySound(true);
                    ToastAndroid.show("Deleted tree locally!", ToastAndroid.SHORT)
                } catch (err: any) {
                    ToastAndroid.show("Failed to delete tree!", ToastAndroid.SHORT)
                }
                setStateChange(prev => prev + 1);
            }, 1000)
        }
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
                            options={allPlots}
                            value={selectedPlot}
                            onSelect={setSelectedPlot}
                            valueGetter={(data) => data.name}
                            keyGetter={(data) => data.id}
                            variant="outlined"
                            boldSelection
                        />
                    </View>
                </View>}
                {!(isFormVisible || isImageFormVisible) && <View style={styles.header}>
                    <SearchBar query={searchQuery} onChange={setSearchQuery} />
                </View>}
                {!(isFormVisible || isImageFormVisible) && <ScrollView style={styles.scrollView} contentContainerStyle={{ alignItems: 'center' }}>
                    {trees.map((tree, index) => (
                        <View style={{ width: '95%', marginVertical: 5 }} key={index}>
                            <TouchableOpacity style={{ width: '100%' }} activeOpacity={0.91} onPress={() => {
                                setSelectedTree(tree);
                                setInfoModalVisible(true);
                            }}>
                                <TreeCard
                                    tree={tree}
                                    plantTypeName={plantTypes.find(plantType => plantType.id === tree.plant_type_id)?.name || ''}
                                    plotName={allPlots.find(plot => plot.id === tree.plot_id)?.name || ''}
                                />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>}
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
                    sapling_id={selectedTree?.sapling_id}
                    tree_status={selectedTree?.tree_status}
                />}

                {selectedTree && <TreeInfo
                    isVisible={isInfoModalVisible}
                    plantType={plantTypes.find(plantType => plantType.id === selectedTree.plant_type_id)?.name || ''}
                    plot={allPlots.find(plot => plot.id === selectedTree.plot_id)?.name || ''}
                    onClose={() => { setInfoModalVisible(false) }}
                    onEdit={() => { setChangeModel('edit'); setIsFormVisible(true); }}
                    onImageAdd={() => { setIsImageFormVisible(true); }}
                    onDelete={handleDelete}
                    tree={selectedTree}
                />}

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