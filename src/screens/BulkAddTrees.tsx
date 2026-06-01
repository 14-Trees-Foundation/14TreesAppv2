import { FC, useCallback, useContext, useEffect, useState } from "react";
import { BackHandler, StyleSheet, ToastAndroid, View } from "react-native";
import { Divider, Icon, Text } from "react-native-paper";
import { Strings } from "../services/Strings";
import GlobalContext from "../context/GlobalContext ";
import SaplingChipList, { SaplingChipItem } from "../components/plots/SaplingChipList";
import { TreeForm } from "../components/trees/NewTreeForm";
import { CreateTreeRequest, Tree } from "../model/tree";
import { DaoClient } from "../services/db/dao";
import { TreeImageType } from "../model/tree_image";
import { Plot } from "../model/plot";
import { useFocusEffect } from "@react-navigation/native";

interface BulkAddTreesProps {
    navigation: any,
    route: any,
}

const BulkAddTrees: FC<BulkAddTreesProps> = ({ navigation, route }) => {
    const plot: Plot = route.params.selectedPlot;
    const saplingIds: string[] = route.params.saplings;
    const { langChanged, setPlaySound } = useContext(GlobalContext);
    useEffect(() => {
        console.log('langChanged inside BulkAddTrees: ', langChanged);
    }, [langChanged]);

    const [saplings, setSaplings] = useState<SaplingChipItem[]>(saplingIds.map(item => ({ sapling: item, selected: false })))
    const [treeModal, setTreeModal] = useState(false)
    const [selectedSapling, setSelectedSapling] = useState<string>('')
    const [trees, setTrees] = useState<Record<string, Tree>>({})
    const [selectedTree, setSelectedTree] = useState<Tree | null>(null)


    const getTreesForSaplings = async () => {
        const daoClient = await DaoClient.authenticate();
        const trees = await daoClient.trees.getTreesBySaplings(saplingIds);
        const treeMap: Record<string, Tree> = {};
        trees.forEach(tree => {
            treeMap[tree.sapling_id] = tree;
        });
        setTrees(treeMap);

        const saplings: SaplingChipItem[] = []
        saplingIds.forEach(saplingId => {
            const tree = treeMap[saplingId];
            saplings.push({
                sapling: saplingId,
                selected: (tree && tree.is_uploaded === 1) ? true : false,
                local: (tree && tree.is_uploaded === 0) ? true : false
            })
        })

        setSaplings(saplings);
    }

    useFocusEffect(useCallback(() => {
        const backAction = () => {
            navigation.goBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [])
    );

    useEffect(() => {
        getTreesForSaplings();
    }, [])

    const handleSaplingPress = (saplingId: string) => {
        const tree = trees[saplingId];
        setSelectedTree(tree ? tree : null);
        setSelectedSapling(saplingId);

        setTreeModal(true);
    }

    const handleTreeSave = (data: Tree | CreateTreeRequest, images?: any) => {
        let hasError = false;
        let changeMode = (selectedTree && selectedTree.sapling_id === selectedSapling) ? 'edit' : "add";

        const saveTree = async () => {
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

            getTreesForSaplings();
        }


        saveTree();
    };


    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text variant='titleMedium' style={{ fontWeight: 'bold' }}>{Strings.labels.Plot}: </Text>
                <Text variant='titleMedium'>{plot.name}</Text>
            </View>
            <Divider />

            {!treeModal && <SaplingChipList
                items={saplings}
                onSelectionChange={handleSaplingPress}
            />}
            {treeModal && <View style={{ flex: 1, alignItems: 'center' }}>
                <TreeForm
                    changeMode={(selectedTree && selectedTree.sapling_id === selectedSapling) ? 'edit' : "add"}
                    tree={selectedTree}
                    saplingID={selectedSapling}
                    defaultPlot={plot}
                    onSubmit={handleTreeSave}
                    onCancel={() => setTreeModal(false)}
                />
            </View>}

            <Divider />
            <View style={styles.footerContainer}>
                <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon source='checkbox-blank' size={20} color='#82b398' />
                        <Text variant='titleSmall' style={{ marginRight: 10 }}> {Strings.labels.AlreadyExists}</Text>
                        <Icon source='checkbox-blank' size={20} color='#ffe7b3' />
                        <Text variant='titleSmall'> {Strings.labels.LocalNew}</Text>
                        <Icon source='checkbox-blank' size={20} color='#daf7dc' />
                        <Text variant='titleSmall'> {Strings.labels.Remaining}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text variant='titleSmall' style={{ fontWeight: 'bold' }}>{Strings.labels.LocalNew}: </Text>
                        <Text variant='titleSmall' >{saplings.filter(item => item.local).length}</Text>
                        <Text variant='titleSmall' style={{ fontWeight: 'bold', marginLeft: 10 }}>{Strings.labels.Remaining}: </Text>
                        <Text variant='titleSmall' >{saplings.length - saplings.filter(item => item.local || item.selected).length}</Text>
                        <Text variant='titleSmall' style={{ fontWeight: 'bold', marginLeft: 10 }}>{Strings.labels.Total}: </Text>
                        <Text variant='titleSmall' >{saplings.length}</Text>
                    </View>
                </View>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        margin: 10,
        paddingLeft: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center'
    },
    footerContainer: {
        margin: 10,
        paddingLeft: 10,
    }
});

export default BulkAddTrees;