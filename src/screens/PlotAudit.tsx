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
import { DatePicker } from '../components/DatePicker';

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
    const [date, setDate] = useState<Date>(new Date());

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

        getUserDetails();
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            const daoClient = await DaoClient.authenticate();
            setLoading(true);
            await getSaplings(daoClient, date);
            setLoading(false);
        }

        fetchData();
    }, [date])

    const getSaplings = async (daoClient: DaoClient, date: Date) => {
        const trees = await daoClient.trees.getTrees(0, -1, undefined, false, plot.id)
        const saplings: SaplingChipItem[] = [];
        for (const tree of trees) {
            const count = await getImagesCountForSapling(tree.sapling_id, date);
            const isAudited = (count.pending + count.synced) > 0
            saplings.push({ sapling: tree.sapling_id, badge: count.pending, selected: isAudited });
        }
        setSaplings(saplings);
    }

    const getImagesCountForSapling = async (saplingId: string, date: Date) => {
        const daoClient = await DaoClient.authenticate();
        const dateStr = date.toISOString().slice(0, 10)
        const synced = await daoClient.treeSnapshots.countTreeSnapshotImagesForSaplingId(saplingId, true, dateStr);
        const notSynced = await daoClient.treeSnapshots.countTreeSnapshotImagesForSaplingId(saplingId, false, dateStr);
        return {synced: synced.add, pending: notSynced.add};
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
                else if (deleted.length === 0) await daoClient.treeSnapshots.insertTreeAdit(selectedSapling, userDetails.id, treeStatus);
                const resp = await getImagesCountForSapling(selectedSapling, date)
                
                const idx = saplings.findIndex(item => item.sapling === selectedSapling);
                if (idx >= 0) {
                    const updatedSaplings = [...saplings];
                    const isAudited = (resp.pending + resp.synced) > 0
                    updatedSaplings[idx] = { sapling: selectedSapling, badge: resp.pending, selected: isAudited };
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
                <View style={{ marginHorizontal: 10, marginBottom: 10, paddingLeft: 10 }}>
                    <Text variant='titleSmall'>{Strings.messages.SelectAuditStartDate}:</Text>
                    <DatePicker
                        label={Strings.labels.Date}
                        value={date}
                        onChange={setDate}
                    />
                </View>
                {!isFormVisible && <View style={{ flex: 1, flexGrow: 1 }}>
                    <Divider />
                    {loading && <View style={{ alignItems: 'center', justifyContent: 'center', alignContent: 'center', flexGrow: 1 }}>
                        <CircleSnail size={100} color={'#059636'}
                            thickness={10} duration={700} spinDuration={2000} />
                    </View>}
                    {!loading && <SaplingChipList
                        items={saplings}
                        onSelectionChange={handleChipPress}
                    />}
                    <Divider />
                    <View style={{ margin: 10, paddingLeft: 10, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                        <View style={{ flexGrow: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon source='checkbox-blank' size={20} color='#82b398' />
                                <Text variant='titleSmall' style={{ marginRight: 10 }}> {Strings.labels.Audited}</Text>
                                <Icon source='checkbox-blank' size={20} color='#daf7dc' />
                                <Text variant='titleSmall' style={{ marginRight: 10 }}> {Strings.labels.NotAudited}</Text>
                                <Icon source='checkbox-blank' size={20} color='orange' />
                                <Text variant='titleSmall'> {Strings.labels.LocalChanges}</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <Text variant='titleSmall' style={{ fontWeight: 'bold' }}>{Strings.labels.Audited}: </Text>
                                <Text variant='titleSmall' >{saplings.filter(item => item.selected).length}</Text>
                                <Text variant='titleSmall' style={{ fontWeight: 'bold', marginLeft: 10 }}>{Strings.labels.LocalChanges}: </Text>
                                <Text variant='titleSmall' >{saplings.filter(item => item.badge).length}</Text>
                                <Text variant='titleSmall' style={{ fontWeight: 'bold', marginLeft: 10 }}>{Strings.labels.Total}: </Text>
                                <Text variant='titleSmall' >{saplings.length}</Text>
                            </View>
                        </View>
                    </View>
                </View>}

                {isFormVisible && selectedSapling && <TreeImageForm
                    sapling_id={selectedSapling}
                    onSubmit={handleSaplingSubmit}
                    onCancel={() => setIsFormVisible(false)}
                />}
            </View>
        </SafeAreaView>
    );
};

export default PlotAudit;
