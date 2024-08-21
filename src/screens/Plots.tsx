import { View, Button, BackHandler, ScrollView, SafeAreaView, StyleSheet, TextInput } from "react-native";
import React, { useContext, useEffect, useState, useCallback } from "react";
import GlobalContext from "../context/GlobalContext ";

import { DaoClient } from "../services/db/dao";
import PlotsForm from "../components/plots/PlotsForm";
import PlotsCard from "../components/plots/PlotsCard";
import PlotsInfo from "../components/plots/PlotsInfo";
import { TouchableOpacity } from "react-native";
import { CreatePlotRequest, Plot } from "../model/plot";
import { useFocusEffect } from "@react-navigation/native";
import SearchBar from "../components/Searchbar";
import InternetBanner from "../components/InternetInfo";
import { Strings } from "../services/Strings";
import Autocomplete from "../components/AutocompleteModal";
import { Site } from "../model/sites";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants } from "../services/Utils";

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
    const [changeMode, setChangeModel] = useState<'add' | 'edit'>('add');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
    const [plots, setPlots] = useState<Plot[]>([]);
    const [siteSearchQuery, setSiteSearchQuery] = useState('');
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);
    const [sites, setSites] = useState<Site[]>([]);

    let daoClient: DaoClient;
    DaoClient.authenticate().then((client) => { daoClient = client; });

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

    useEffect(() => {
        if (searchQuery.length !== 0) return;
        setTimeout(async () => {
            let resp = await daoClient.plots.getPlots(0, 100, undefined, false, selectedSite?.id);
            setPlots(resp)
        }, 100)
    }, [stateChange, searchQuery, selectedSite])

    useEffect(() => {
        if (searchQuery.length < 1) return;
        setTimeout(async () => {
            let plots = await daoClient.plots.searchPlots(searchQuery, 0, 100, selectedSite?.id);
            setPlots(plots);
        }, 100)
    }, [stateChange, searchQuery, selectedSite])

    const handleSave = (data: Plot | CreatePlotRequest) => {
        setIsFormVisible(false);
        setTimeout(async () => {
            if (changeMode === 'add') await daoClient.plots.createPlot(data);
            else {
                const updatedPlot = JSON.parse(JSON.stringify(data)) as Plot;
                console.log(updatedPlot)
                await daoClient.plots.updatePlot(updatedPlot);
            }
            setStateChange(prev => prev + 1);
        }, 100)
    };

    const handleDelete = () => {
        if (selectedPlot) {
            setTimeout(async () => {
                await daoClient.plots.deletePlot(selectedPlot.local_id);
                setStateChange(prev => prev + 1);
            }, 1000)
        }
    }

    useFocusEffect(
        useCallback(() => {
            const getSitesData = async () => {
                const daoClient = await DaoClient.authenticate();
                const siteId = await AsyncStorage.getItem(Constants.selectedSiteId)
                let site: Site | null = null;
                if (siteId) {
                    site = await daoClient.sites.getSiteByLiveId(parseInt(siteId));
                    setSelectedSite(site);
                } else {
                    setSelectedSite(null);
                }
                const sites = await daoClient.sites.getSites(0, 100)
                if (site) {
                    const idx = sites.findIndex(value => value.id === site?.id);
                    if (idx < 0) setSites([site, ...sites]);
                    else setSites(sites);
                }
                else setSites(sites);
            }

            getSitesData();
            return () => { }
        }, [])
    )

    useEffect(() => {
        if (siteSearchQuery.length < 1) return;
        setTimeout(async () => {
            const daoClient = await DaoClient.authenticate();
            let sites = await daoClient.sites.searchSites(siteSearchQuery, 0, 100);
            setSites(sites);
        }, 10)
    }, [siteSearchQuery])

    const handleSiteSelection = (site: Site | null) => {
        setSelectedSite(site);
    }

    return (
        <View style={{ flex: 1 }}>
            <InternetBanner />
            <SafeAreaView style={styles.safeArea}>
                {!isFormVisible && <View style={{ height: 'auto', alignItems: 'center', width: "96%" }}>
                    <View style={{ width: '100%', flexGrow: 1, marginTop: 15 }}>
                        <Autocomplete
                            label={selectedSite ? Strings.labels.SelectedSite : Strings.labels.SelectSite}
                            options={sites}
                            value={selectedSite}
                            onSelect={handleSiteSelection}
                            valueGetter={(data) => data.name_english}
                            keyGetter={(data) => data.id}
                            variant="outlined"
                            boldSelection
                            onSearch={setSiteSearchQuery}
                        />
                    </View>
                </View>}
                {!isFormVisible && <View style={styles.header}>
                    <SearchBar query={searchQuery} onChange={setSearchQuery} />
                </View>}
                {!isFormVisible && <ScrollView style={styles.scrollView} contentContainerStyle={{ alignItems: 'center' }}>
                    {plots.map((plot, index) => (
                        <View style={{ width: '95%' }} key={index}>
                            <TouchableOpacity style={{ width: '100%', alignItems: 'center' }} activeOpacity={0.9} key={index} onPress={() => {
                                setSelectedPlot(plot);
                                setInfoModalVisible(true);
                            }}>
                                <PlotsCard
                                    plot={plot}
                                />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>}
                {/* {!isFormVisible && <AddIconButton onClick={() => {
                setIsFormVisible(true);
                setSelectedVisit(null);
                setChangeModel('add');
            }} />} */}

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
                    onSaplingEdit={() => {
                        navigation.navigate(
                            Strings.screenNames.getString('ChangePlot', Strings.english),
                            { selectedPlot },
                        )
                    }}
                    onDelete={handleDelete}
                    plot={selectedPlot}
                />}
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        alignItems: 'center'
    },
    header: {
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 10,
        height: 50,
        width: '95%'
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

