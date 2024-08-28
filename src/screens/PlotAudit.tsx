import React, { FC, useContext, useEffect, useState } from 'react';
import { BackHandler, SafeAreaView, ToastAndroid, View } from 'react-native';
import SaplingChipList, { SaplingChipItem } from '../components/plots/SaplingChipList';
import { Button, Divider, Icon, Text } from 'react-native-paper';
import { DaoClient } from '../services/db/dao';
import GlobalContext from '../context/GlobalContext ';
import { CircleSnail } from 'react-native-progress';
import { Strings } from '../services/Strings';
import TreeImageForm from '../components/trees/TreeImagesForm';
import { CreateTreeSnapshotRequest } from '../model/tree_snapshot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Constants } from '../services/Utils';

interface PlotSaplingsProps {
    navigation: any,
    route: any,
}

const PlotAudit: FC<PlotSaplingsProps> = ({ navigation, route }) => {
    const plot = route.params.selectedPlot;
    const { langChanged, setPlaySound } = useContext(GlobalContext);
    useEffect(() => {
        console.log('langChanged inside PlotAudit: ', langChanged);
    }, [langChanged]);

    const [loading, setLoading] = useState(false)
    const [isFormVisible, setIsFormVisible] = useState(false)
    const [selectedSapling, setSelectedSapling] = useState<string | null>(null)
    const [saplings, setSaplings] = useState<SaplingChipItem[]>([])
    const [userDetails, setUserDetails] = useState<any>(null);

    useEffect(() => {
        const backAction = () => {
            navigation.goBack()
            return true; // Prevent default behavior (exit app)
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [])

    useEffect(() => {

        const getUserDetails = async () => {
            const userData = await AsyncStorage.getItem(Constants.userDetailsKey)
            if (userData) setUserDetails(JSON.parse(userData));
        }

        const getSaplings = async (daoClient: DaoClient) => {
            const trees = await daoClient.trees.getTrees(0, -1, undefined, false, plot.id)
            const saplings: SaplingChipItem[] = [];
            for (const tree of trees) {
                const count = await getImagesCountForSapling(tree.sapling_id);
                saplings.push({ sapling: tree.sapling_id, badge: count });
            }
            setSaplings(saplings);
        }

        const fetchData = async () => {
            const daoClient = await DaoClient.authenticate();
            setLoading(true);
            await getUserDetails();
            await getSaplings(daoClient);
            setLoading(false);
        }

        fetchData();
    }, [])

    const getImagesCountForSapling = async (saplingId: string) => {
        const daoClient = await DaoClient.authenticate();
        const resp = await daoClient.treeSnapshots.countTreeSnapshotImagesForSaplingId(saplingId, false);
        return resp.add;
    }

    const handleSaplingSubmit = (images: CreateTreeSnapshotRequest[], deleted: number[], treeStatus: string) => {
        setIsFormVisible(false);
        setTimeout(async () => {
            if (selectedSapling) {
                const daoClient = await DaoClient.authenticate();
                for (const imageId of deleted) {
                    await daoClient.treeSnapshots.deleteTreeSnapshot(imageId);
                }
                if (images.length > 0 ) await daoClient.treeSnapshots.insertTreeSnapshots(selectedSapling, userDetails.id, images);
                else await daoClient.treeSnapshots.insertTreeAdit(selectedSapling, userDetails.id, treeStatus);
                const resp = await getImagesCountForSapling(selectedSapling)
                
                const idx = saplings.findIndex(item => item.sapling === selectedSapling);
                if (idx >= 0) {
                    const updatedSaplings = [...saplings];
                    updatedSaplings[idx] = { sapling: selectedSapling, badge: resp };
                    setSaplings(updatedSaplings);
                }

                setPlaySound(true);
                setSelectedSapling(null);
                ToastAndroid.show("Saved Changes locally!", ToastAndroid.LONG)
            }
        }, 10)
    }

    const handleChipPress = (item: string) => {
        setIsFormVisible(true);
        setSelectedSapling(item);
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>

                <View style={{ margin: 10, paddingLeft: 10, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Text variant='titleLarge' style={{ fontWeight: 'bold' }}>{Strings.labels.Plot}: </Text>
                    <Text variant='titleMedium'>{plot.name}</Text>
                </View>
                {!isFormVisible && <View style={{ flexGrow: 1 }}>
                    <Divider />
                    {loading && <View style={{ alignItems: 'center', justifyContent: 'center', alignContent: 'center', flexGrow: 1 }}>
                        <CircleSnail size={100} color={'#059636'}
                            thickness={10} duration={700} spinDuration={2000} />
                    </View>}
                    {!loading && <SaplingChipList
                        items={saplings}
                        selectedItems={saplings.filter(item => (item.badge && item.badge > 0))}
                        onSelectionChange={handleChipPress}
                    />}
                    <Divider />
                    <View style={{ margin: 10, paddingLeft: 10, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                        <View style={{ flexGrow: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon source='checkbox-blank' size={20} color='#82b398' />
                                <Text variant='titleSmall' style={{ marginRight: 10 }}> {Strings.labels.Audited}</Text>
                                <Icon source='checkbox-blank' size={20} color='#daf7dc' />
                                <Text variant='titleSmall'> {Strings.labels.NotAudited}</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <Text variant='titleSmall' style={{ fontWeight: 'bold' }}>{Strings.labels.Audited}: </Text>
                                <Text variant='titleSmall' >{saplings.filter(item => (item.badge && item.badge > 0)).length}</Text>
                                <Text variant='titleSmall' style={{ fontWeight: 'bold', marginLeft: 10 }}>{Strings.labels.Total}: </Text>
                                <Text variant='titleSmall' >{saplings.length}</Text>
                            </View>
                        </View>
                    </View>
                </View>}

                {isFormVisible && selectedSapling && <TreeImageForm
                    sapling_id={selectedSapling}
                    tree_status='healthy'
                    onSubmit={handleSaplingSubmit}
                    onCancel={() => setIsFormVisible(false)}
                />}
            </View>
        </SafeAreaView>
    );
};

export default PlotAudit;
