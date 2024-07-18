import { View, Button, BackHandler, ScrollView, SafeAreaView, StyleSheet, TextInput, Text } from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import GlobalContext from "../context/GlobalContext ";

import { DaoClient } from "../services/db/dao";
import { TreeForm } from "../components/trees/NewTreeForm";
import TreeCard from "../components/trees/TreeCard";
import TreeInfo from "../components/trees/TreeInfo";
import { TouchableOpacity } from "react-native";
import { CreateTreeRequest, Tree } from "../model/tree";
import { Utils } from "../services/Utils";
import { useFocusEffect } from "@react-navigation/native";
import { NewCustomDropdown } from "../components/NewCustomDropdown";
import { Strings } from "../services/Strings";

interface TreesInputProps {
    navigation: any
}

const Trees: React.FC<TreesInputProps> = ({ navigation }) => {

    const { lightTheme } = useContext(GlobalContext);
    const [stateChange, setStateChange] = useState(0);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isInfoModalVisible, setInfoModalVisible] = useState(false);
    const [changeMode, setChangeModel] = useState<'add' | 'edit'>('add');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
    const [page, setPage] = useState(0);
    const [trees, setTrees] = useState<Tree[]>([]);
    const [plantTypes, setPlantTypes] = useState<any[]>([]);
    const [plots, setPlots] = useState<any[]>([]);
    const [selectedPlot, setSelectedPlot] = useState<any>(null);

    let localClient: DaoClient;
    DaoClient.authenticate().then((client) => { localClient = client; });

    useFocusEffect(
        useCallback(() => {
          setIsFormVisible(false);
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
            const { treeTypes, plots } = await Utils.getLocalTreeTypesAndPlots();

            treeTypes && setPlantTypes(treeTypes);
            plots && setPlots(plots);
        })
    }, [])

    useEffect(() => {
        if (searchQuery.length !== 0) return;
        setTimeout(async () => {
            let resp = await localClient.trees.getTrees(page * 10, 10, undefined, false, selectedPlot?.id);
            if (page != 0) setTrees([...trees, ...resp]);
            else setTrees(resp)

        }, 1000)
    }, [page, searchQuery, stateChange, selectedPlot])

    useEffect(() => {
        if (searchQuery.length < 1) return;
        setTimeout(async () => {
            let trees = await localClient.trees.searchTrees(searchQuery, 0, 20, selectedPlot?.id);
            setTrees(trees);
        }, 1000)
    }, [searchQuery, stateChange, selectedPlot])

    const handleSave = (data: Tree | CreateTreeRequest, image?: any) => {
        setTimeout(async () => {

            if (changeMode === 'add') {
                data = JSON.parse(JSON.stringify(data)) as CreateTreeRequest;
                await localClient.trees.createTree(data)
            } else {
                data = JSON.parse(JSON.stringify(data)) as Tree;
                await localClient.trees.updateTree(data)
            };

            if (image) {
                await localClient.treeImages.upsertTreeImage({ 
                    name: image.name, 
                    data: image.data,
                    sapling_id: data.sapling_id,
                    type: 'tree_image',
                    is_active: null,
                    user_id: null,
                })
            }

            setStateChange(stateChange + 1);
        }, 1000)

    };

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
            {!isFormVisible && <View style={{ height: 'auto', alignItems: 'center', width: "96%"}}>
                <View style={{ width: '100%', alignItems: 'flex-start', marginBottom: 5, marginTop: 15}}>
                    <Text style={{ color: 'black' }}>Selected Plot:</Text>
                </View>
                    <NewCustomDropdown 
                        label={Strings.labels.SelectPlot}
                        options={plots}
                        value={selectedPlot}
                        onChange={setSelectedPlot}
                        valueGetter={(data) => data.name}
                        keyGetter={(data) => data.id}
                        scrollable={true}
                    />
            </View>}
            {!isFormVisible && <View style={styles.header}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search"
                    placeholderTextColor={'black'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <View style={styles.buttonAdd}>
                    <Button title="Add" onPress={() => {
                        setIsFormVisible(true);
                        setSelectedTree(null);
                        setChangeModel('add');
                    }} />
                </View>
            </View>}
            {!isFormVisible && <ScrollView style={styles.scrollView} contentContainerStyle={{alignItems: 'center'}}>
                {trees.map((tree, index) => (
                <View style={{ width: '95%' }} key={index}>
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

            {isFormVisible && <TreeForm
                changeMode={changeMode}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleSave}
                tree={selectedTree}
            />}

            {selectedTree && <TreeInfo
                isVisible={isInfoModalVisible}
                plantType={ plantTypes.find(plantType => plantType.id === selectedTree.plant_type_id)?.name || '' }
                plot={ plots.find(plot => plot.id === selectedTree.plot_id)?.name || '' }
                onClose={() => { setInfoModalVisible(false) }}
                onEdit={() => { setChangeModel('edit'); setIsFormVisible(true); }}
                onDelete={handleDelete}
                tree={selectedTree}
            />}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        alignItems: 'center'
    },
    header: {
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
        width: '100%'
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
});

export default Trees;