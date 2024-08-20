import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { BackHandler, SafeAreaView, ToastAndroid, View } from 'react-native';
import SaplingChipList from '../components/plots/SaplingChipList';
import { Button, Divider, Text } from 'react-native-paper';
import Autocomplete from '../components/AutocompleteModal';
import { Plot } from '../model/plot';
import { DaoClient } from '../services/db/dao';
import ChangePlotModal from '../components/plots/ChangePlotModal';
import GlobalContext from '../context/GlobalContext ';

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
            await getSaplings(daoClient);
            await getPlots(daoClient);
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

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>

                <View style={{ margin: 10, paddingLeft: 10, flexDirection: 'row', flexWrap: 'wrap' }}>
                    <Text variant='titleLarge' style={{ fontWeight: 'bold' }}>Plot: </Text>
                    <Text variant='titleLarge'>{plot.name}</Text>
                </View>
                <View style={{ marginHorizontal: 10, marginBottom: 10, paddingLeft: 10 }}>
                <Text variant='titleSmall'>Select a new plot name:</Text>
                    <Autocomplete 
                        label='Select a new Plot'
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
                <SaplingChipList 
                    items={saplings} 
                    selectedItems={selectedSaplings} 
                    onSelectionChange={setSelectedSapling}
                />
                <Divider />
                <View style={{ margin: 10, paddingLeft: 10, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Text variant='titleSmall' style={{ fontWeight: 'bold' }}>Trees selected: </Text>
                    <Text variant='titleSmall' style={{ flexGrow: 1 }}>{selectedSaplings.length}</Text>
                    <Button 
                        style={{ marginHorizontal: 3, backgroundColor: '#93faa9' }} 
                        mode='elevated'
                        disabled={ selectedPlot === null || selectedSaplings.length === 0 }
                        onPress={() => setModalOpen(true)}
                    >Change Plot</Button>
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
