import { View, BackHandler, SafeAreaView, StyleSheet } from "react-native";
import React, { useContext, useEffect, useState, useCallback } from "react";
import GlobalContext from "../context/GlobalContext ";

import { DaoClient } from "../services/db/dao";
import PlotsForm from "../components/plots/PlotsForm";
import PlotsCard from "../components/plots/PlotsCard";
import PlotsInfo from "../components/plots/PlotsInfo";
import { TouchableOpacity } from "react-native";
import { CreatePlotRequest, LocationPlot, Plot, locationPlotToPlot } from "../model/plot";
import { useFocusEffect } from "@react-navigation/native";
import SearchBar from "../components/Searchbar";
import InternetBanner from "../components/InternetInfo";
import { Strings } from "../services/Strings";
import Autocomplete from "../components/AutocompleteModal";
import { LocationSite } from "../model/sites";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants } from "../services/Utils";
import SaplingRangeModal from "../components/plots/SaplingRangeModal";
import CardList from "../components/CardList";


interface PlotsInputProps {
    navigation: any
}

const Plots: React.FC<PlotsInputProps> = ({ navigation }) => {

    const { langChanged } = useContext(GlobalContext);
    useEffect(() => {
        console.log('langChanged inside Plots: ', langChanged);
    }, [langChanged]);
    const [stateChange, setStateChange] = useState(0);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isInfoModalVisible, setInfoModalVisible] = useState(false);
    const [bulkAddModal, setBulkAddModal] = useState(false);
    const [changeMode, setChangeModel] = useState<'add' | 'edit'>('add');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
    const [plots, setPlots] = useState<Plot[]>([]);
    const [siteSearchQuery, setSiteSearchQuery] = useState('');
    const [selectedSite, setSelectedSite] = useState<LocationSite | null>(null);
    const [sites, setSites] = useState<LocationSite[]>([]);

    useFocusEffect(
        useCallback(() => {
            setIsFormVisible(false);
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

    // Load plots from local SQLite location_plots table
    useEffect(() => {
        const fetchPlots = async () => {
            if (!selectedSite) {
                setPlots([]);
                return;
            }

            const daoClient = await DaoClient.authenticate();
            const locationPlots = await daoClient.locationPlots.getLocationPlots(selectedSite.id);
            const mapped = locationPlots.map(locationPlotToPlot);
            const filtered = searchQuery.length > 0
                ? mapped.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                : mapped;
            setPlots(filtered);
        };

        fetchPlots();
    }, [stateChange, searchQuery, selectedSite]);

    const handleSave = (data: Plot | CreatePlotRequest) => {
        setIsFormVisible(false);
        const savePlotData = async () => {
            const daoClient = await DaoClient.authenticate();
            if (changeMode === 'add') await daoClient.plots.createPlot(data);
            else {
                const updatedPlot = JSON.parse(JSON.stringify(data)) as Plot;
                console.log(updatedPlot)
                await daoClient.plots.updatePlot(updatedPlot);
            }
            setStateChange(prev => prev + 1);
        }

        savePlotData();
    };

    const handleDelete = () => {
        const deletePlot = async () => {
            if (selectedPlot) {
                const daoClient = await DaoClient.authenticate();
                await daoClient.plots.deletePlot(selectedPlot?.local_id);
                setStateChange(prev => prev + 1);
            }
        }

        deletePlot();
    }

    useFocusEffect(
        useCallback(() => {
            const getSitesData = async () => {
                const daoClient = await DaoClient.authenticate();

                // Read selected site from AsyncStorage (set on Home page)
                const data = await AsyncStorage.getItem(Constants.selectedSite);
                if (data) {
                    const raw = JSON.parse(data);
                    const site: LocationSite = {
                        ...raw,
                        location_name: raw.location_name ?? raw.name_english ?? '',
                    };
                    setSelectedSite(site);
                } else {
                    setSelectedSite(null);
                }

                // Load site list from local location_sites table (populated during sync)
                const localSites = await daoClient.locationSites.getLocationSites(0, -1);
                setSites(localSites);
            };

            getSitesData();
            return () => { };
        }, [])
    );

    useEffect(() => {
        if (siteSearchQuery.length < 1) return;
        setTimeout(async () => {
            const daoClient = await DaoClient.authenticate();
            const results = await daoClient.locationSites.searchLocationSites(siteSearchQuery, 0, 100);
            setSites(results);
        }, 10);
    }, [siteSearchQuery]);

    const handleSiteSelection = (site: LocationSite | null) => {
        setSelectedSite(site);
        if (site) AsyncStorage.setItem(Constants.selectedSite, JSON.stringify(site));
        else AsyncStorage.removeItem(Constants.selectedSite);
    };

    const renderPlotItem = (plot: Plot, index: number) => {
        return (
            <View style={{ width: '100%', paddingHorizontal: 10 }}>
                <TouchableOpacity style={{ width: '100%' }} activeOpacity={0.9} onPress={() => {
                    setSelectedPlot(plot);
                    setInfoModalVisible(true);
                }}>
                    <PlotsCard
                        plot={plot}
                        onAuditPress={() => {
                            navigation.navigate(
                                Strings.screenNames.getString('PlotAudit', Strings.english),
                                { selectedPlot: plot },
                            )
                        }}
                        onAddTreesPress={() => {
                            setBulkAddModal(true);
                            setSelectedPlot(plot);
                        }}
                    />
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <InternetBanner />
            <SafeAreaView style={styles.safeArea}>
                {!isFormVisible && <View style={{ height: 'auto', alignItems: 'center', width: "100%" }}>
                    <View style={{ width: '96%', flexGrow: 1, marginTop: 15 }}>
                        <Autocomplete
                            label={selectedSite ? Strings.labels.SelectedSite : Strings.labels.SelectSite}
                            options={sites}
                            value={selectedSite}
                            onSelect={handleSiteSelection}
                            valueGetter={(data) => data.location_name}
                            keyGetter={(data) => data.id}
                            variant="outlined"
                            boldSelection
                            onSearch={setSiteSearchQuery}
                        />
                    </View>
                </View>}
                {!isFormVisible && <View style={styles.header}>
                    <View style={{ width: '96%', flexGrow: 1, }}>
                        <SearchBar query={searchQuery} onChange={(text: string) => { setSearchQuery(text) }} />
                    </View>
                </View>}
                {!isFormVisible && <CardList
                    data={plots}
                    renderItem={renderPlotItem}
                    pagination={false}
                />}

                {isFormVisible && <PlotsForm
                    changeMode={changeMode}
                    onCancel={() => setIsFormVisible(false)}
                    onSubmit={handleSave}
                    plot={selectedPlot}
                />}

                {selectedPlot && <PlotsInfo
                    isVisible={isInfoModalVisible}
                    onClose={() => { setInfoModalVisible(false) }}
                    onEdit={() => { setChangeModel('edit'); setIsFormVisible(true); }}
                    onDelete={handleDelete}
                    plot={selectedPlot}
                />}

                <SaplingRangeModal
                    visible={bulkAddModal}
                    onClose={() => { setBulkAddModal(false) }}
                    onSubmit={(saplings) => {
                        navigation.navigate(
                            Strings.screenNames.getString('BulkAddTrees', Strings.english),
                            { selectedPlot, saplings },
                        )
                    }}
                />
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
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 10,
        height: 50,
        width: '100%'
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

export default Plots;
