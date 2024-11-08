import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { BackHandler, SafeAreaView, ToastAndroid, View } from 'react-native';
import SaplingChipList from '../components/plots/SaplingChipList';
import { Button, Divider, Icon, Text } from 'react-native-paper';
import Autocomplete from '../components/AutocompleteModal';
import { Plot } from '../model/plot';
import { DaoClient } from '../services/db/dao';
import ChangePlotModal from '../components/plots/ChangePlotModal';
import GlobalContext from '../context/GlobalContext ';
import { CircleSnail } from 'react-native-progress';
import { Strings } from '../services/Strings';

interface PlotSaplingsProps {
    navigation: any,
    route: any,
}

const PlotSaplings: FC<PlotSaplingsProps> = ({ navigation, route }) => {
    const plot = route.params.selectedPlot;
    const { langChanged, setPlaySound } = useContext(GlobalContext);
    useEffect(() => {
        console.log('langChanged inside PlotSaplings: ', langChanged);
    }, [langChanged]);

    const [loading, setLoading] = useState(false)
    const [selectedSaplings, setSelectedSapling] = useState<string[]>([])
    const [saplings, setSaplings] = useState<string[]>([])
    const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)
    const [plots, setPlots] = useState<Plot[]>([])
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const backAction = () => {
            navigation.goBack()
            return true; // Prevent default behavior (exit app)
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [])

    useEffect(() => {
        const searchPlots = async (searchQuery: string) => {
            const daoClient = await DaoClient.authenticate();
            const plots = await daoClient.plots.searchPlots(searchQuery, 0, 100);
            setPlots(plots);
        }
        if (searchQuery.length === 0) return;
        searchPlots(searchQuery);
    }, [searchQuery])

    useEffect(() => {
        const getPlots = async (daoClient: DaoClient) => {
            const plots = await daoClient.plots.getPlots(0, 100);
            setPlots(plots);
        }

        const getSaplings = async (daoClient: DaoClient) => {
            const trees = await daoClient.trees.getTrees(0, -1, undefined, false, plot.id)
            const saplings = trees.map(tree => tree.sapling_id);
            setSaplings(saplings);
        }

        const fetchData = async () => {
            const daoClient = await DaoClient.authenticate();
            setLoading(true);
            await getSaplings(daoClient);
            await getPlots(daoClient);
            setLoading(false);
        }

        fetchData();
    }, [])

    const handlePlotSelection = (selected: Plot | null) => {
        if (selected && selected.id === plot.id) {
            ToastAndroid.show('Please select a different plot', ToastAndroid.LONG);
            return;
        }
        setSelectedPlot(selected);
    }

    const handleSubmit = async () => {
        if (!selectedPlot || !selectedPlot.id) return;

        const daoClient = await DaoClient.authenticate();
        await daoClient.trees.updateTreesPlot(selectedSaplings, selectedPlot.id);
        setModalOpen(false);
        setPlaySound(true);
        navigation.goBack();
    }

    const handleChipPress = (item: string) => {
        let newSelectedItems = [...selectedSaplings];
        if (newSelectedItems.includes(item)) {
            newSelectedItems = newSelectedItems.filter(chip => chip !== item);
        } else {
            newSelectedItems.push(item);
        }
        setSelectedSapling(newSelectedItems);
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>

                <View style={{ margin: 10, paddingLeft: 10, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Text variant='titleLarge' style={{ fontWeight: 'bold' }}>{Strings.labels.Plot}: </Text>
                    <Text variant='titleLarge'>{plot.name}</Text>
                </View>
                <View style={{ marginHorizontal: 10, marginBottom: 10, paddingLeft: 10 }}>
                    <Text variant='titleSmall'>{Strings.messages.SelectNewPlot}:</Text>
                    <Autocomplete
                        label={selectedPlot ? Strings.labels.SelectedPlot : Strings.labels.SelectPlot}
                        value={selectedPlot}
                        options={plots}
                        keyGetter={(option) => option.local_id}
                        valueGetter={(option) => option.name}
                        onSelect={handlePlotSelection}
                        variant='outlined'
                        onSearch={setSearchQuery}
                    />
                </View>
                <Divider />
                {loading && <View style={{ alignItems: 'center', justifyContent: 'center', alignContent: 'center', flexGrow: 1 }}>
                    <CircleSnail size={100} color={'#059636'}
                        thickness={10} duration={700} spinDuration={2000} />
                </View>}
                {!loading && <SaplingChipList
                    items={saplings.map(sapling => ({ sapling }))}
                    selectedItems={selectedSaplings.map(sapling => ({ sapling }))}
                    onSelectionChange={handleChipPress}
                />}
                <Divider />
                <View style={{ margin: 10, paddingLeft: 10, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                    <View style={{ flexGrow: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon source='checkbox-blank' size={20} color='#82b398' />
                            <Text variant='titleSmall' style={{ marginRight: 10 }}> {Strings.labels.Selected}</Text>
                            <Icon source='checkbox-blank' size={20} color='#daf7dc' />
                            <Text variant='titleSmall'> {Strings.labels.NotSelected}</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text variant='titleSmall' style={{ fontWeight: 'bold' }}>{Strings.labels.Selected}: </Text>
                            <Text variant='titleSmall' >{selectedSaplings.length}</Text>
                            <Text variant='titleSmall' style={{ fontWeight: 'bold', marginLeft: 10 }}>{Strings.labels.Total}: </Text>
                            <Text variant='titleSmall' >{saplings.length}</Text>
                        </View>
                    </View>
                    <Button
                        style={{ marginHorizontal: 3 }}
                        mode='elevated'
                        buttonColor='#93faa9'
                        disabled={selectedPlot === null || selectedSaplings.length === 0}
                        onPress={() => setModalOpen(true)}
                    >{Strings.buttonLabels.ChangePlot}</Button>
                </View>

                {selectedPlot && <ChangePlotModal
                    visible={modalOpen}
                    fromPlot={plot.name}
                    toPlot={selectedPlot.name}
                    selectedSaplings={selectedSaplings}
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleSubmit}
                />}
            </View>
        </SafeAreaView>
    );
};

export default PlotSaplings;
