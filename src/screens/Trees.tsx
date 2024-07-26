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
import { Image } from "../model/common";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Loading } from "../components/Loading";

interface TreesInputProps {
    navigation: any
}

const Trees: React.FC<TreesInputProps> = ({ navigation }) => {

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
    const [plots, setPlots] = useState<any[]>([]);
    const [selectedPlot, setSelectedPlot] = useState<any>(null);
    const [userDetails, setUserDetails] = useState<any>(null);

    let localClient: DaoClient;
    DaoClient.authenticate().then((client) => { localClient = client; });

    useFocusEffect(
        useCallback(() => {
          setIsFormVisible(false);
          setIsImageFormVisible(false);
          setStateChange(stateChange + 1);
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
            const { treeTypes, plots } = await Utils.getLocalTreeTypesAndPlots();

            treeTypes && setPlantTypes(treeTypes);
            plots && setPlots(plots);
        })
    }, [])

    useEffect(() => {
        if (searchQuery.length !== 0) return;
        setTimeout(async () => {
            let resp = await localClient.trees.getTrees(0, 100, undefined, false, selectedPlot?.id);
            setTrees(resp)

        }, 1000)
    }, [searchQuery, stateChange, selectedPlot])

    useEffect(() => {
        if (searchQuery.length < 1) return;
        setTimeout(async () => {
            let trees = await localClient.trees.searchTrees(searchQuery, 0, 100, selectedPlot?.id);
            setTrees(trees);
        }, 1000)
    }, [searchQuery, stateChange, selectedPlot])

    const handleSave = (data: Tree | CreateTreeRequest, images?: any) => {
        setTimeout(async () => {
            setLoading(true);
            if (changeMode === 'add') {
                data = JSON.parse(JSON.stringify(data)) as CreateTreeRequest;
                await localClient.trees.createTree(data)
                ToastAndroid.show("Added Tree Locally!", ToastAndroid.LONG)
            } else {
                data = JSON.parse(JSON.stringify(data)) as Tree;
                await localClient.trees.updateTree(data)
                ToastAndroid.show("Updated Tree Locally!", ToastAndroid.LONG)
            };

            const upsertImage = async (type: TreeImageType) => {
                if (images[type]) {
                    await localClient.treeImages.upsertTreeImage({ 
                        name: images[type].name, 
                        data: images[type].data,
                        sapling_id: data.sapling_id,
                        type: type,
                        is_active: null,
                        user_id: null,
                    })
                }
            }
            upsertImage('tree_image')
            upsertImage('user_card_image')
            upsertImage('user_tree_image')

            ToastAndroid.show("Updated Tree images locally!", ToastAndroid.LONG)
            setLoading(false);
            setStateChange(stateChange + 1);
        }, 1000)

    };

    const handleImagesSave = (images: Image[]) => {
        setIsImageFormVisible(false);
        setTimeout(async () => {
            if (images.length > 0 && selectedTree) {
                const daoClient = await DaoClient.authenticate();
                await daoClient.treeSnapshots.insertTreeSnapshots(selectedTree.sapling_id, userDetails.id, images)
                ToastAndroid.show("Added Tree images locally!", ToastAndroid.LONG)
            }
        }, 10)
    }

    const handleDelete = () => {
        if (selectedTree) {
            setTimeout(async () => {
                await localClient.trees.deleteTree(selectedTree.local_id);
                setStateChange(stateChange + 1);
            }, 1000)
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {!(isFormVisible || isImageFormVisible) && <View style={{ height: 'auto', alignItems: 'center', width: "96%"}}>
                <View style={{width: '100%', flexGrow: 1, marginTop: 15}}>
                    <Autocomplete 
                        label={selectedPlot ? Strings.labels.SelectedPlot : Strings.labels.SelectPlot}
                        options={plots}
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
                <SearchBar onChange={setSearchQuery} />
            </View>}
            {!(isFormVisible || isImageFormVisible) && <ScrollView style={styles.scrollView} contentContainerStyle={{alignItems: 'center'}}>
                {trees.map((tree, index) => (
                <View style={{ width: '95%', marginVertical: 5 }} key={index}>
                    <TouchableOpacity style={{ width: '100%' }} activeOpacity={0.91} onPress={() => {
                        setSelectedTree(tree);
                        setInfoModalVisible(true);
                    }}>
                        <TreeCard 
                            tree={tree}
                            plantTypeName={plantTypes.find(plantType => plantType.id === tree.plant_type_id)?.name || ''}
                            plotName={plots.find(plot => plot.id === tree.plot_id)?.name || ''}
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
            />}

            {selectedTree && <TreeInfo
                isVisible={isInfoModalVisible}
                plantType={ plantTypes.find(plantType => plantType.id === selectedTree.plant_type_id)?.name || '' }
                plot={ plots.find(plot => plot.id === selectedTree.plot_id)?.name || '' }
                onClose={() => { setInfoModalVisible(false) }}
                onEdit={() => { setChangeModel('edit'); setIsFormVisible(true); }}
                onImageAdd={() => { setIsImageFormVisible(true); }}
                onDelete={handleDelete}
                tree={selectedTree}
            />}

            <Loading loading={loading}/>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        alignItems: 'center'
    },
    header: {
        marginVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        width: '95%'
    },
    searchInput: {
        flex: 1,
        width: '80%',
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        marginRight: 10,
        color: 'black'
    },
    buttonAdd: {
        width: '20%',
        height: '100%',
        justifyContent: 'center'
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