import { View, Button, BackHandler, ScrollView, SafeAreaView, StyleSheet, TextInput, Text } from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import GlobalContext from "../context/GlobalContext ";

import { DaoClient } from "../services/db/dao";
import SiteForm from "../components/sites/SitesForm";
import SiteCard from "../components/sites/SitesCard";
import SiteInfo from "../components/sites/SitesInfo";
import { CreateSiteRequest, Site } from "../model/sites";
import { TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import SearchBar from "../components/Searchbar";
import InternetBanner from "../components/InternetInfo";


interface SitesInputProps {
    navigation: any
}


const Sites: React.FC<SitesInputProps> = ({ navigation }) => {

    const { langChanged } = useContext(GlobalContext);
    useEffect(() => {
        console.log('langChanged inside Sites: ', langChanged);
    }, [langChanged]);
    const [stateChange, setStateChange] = useState(0);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isInfoModalVisible, setInfoModalVisible] = useState(false);
    const [changeMode, setChangeModel] = useState<'add' | 'edit'>('add');
    const [searchQuery, setSearchQuery] = useState('');
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
        if (searchQuery.length < 1) return;
        setTimeout(async () => {
            let sites = await daoClient.sites.searchSites(searchQuery, 0, 100);
            setSites(sites);
        }, 1000)
    }, [searchQuery, stateChange])

    useEffect(() => {
        if (searchQuery.length !== 0) return;
        setTimeout(async () => {
            let sites = await daoClient.sites.getSites(0, 100);
            setSites(sites);
        }, 1000)
    }, [searchQuery, stateChange])

    const handleSave = (data: Site | CreateSiteRequest) => {
        setTimeout(async () => {
            if (changeMode === 'add') {
                let request = JSON.parse(JSON.stringify(data)) as CreateSiteRequest;
                await daoClient.sites.createSite(request)
            } else {
                let request = JSON.parse(JSON.stringify(data)) as Site;
                await daoClient.sites.updateSite(request)
            };

        }, 1000)
    };

    const handleDelete = () => {
        if (selectedSite) {
            setTimeout(async () => {
                await daoClient.sites.deleteSite(selectedSite.local_id);
            }, 1000)
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <InternetBanner />
            <SafeAreaView style={styles.safeArea}>
                {!isFormVisible && <View style={styles.header}>
                    <SearchBar query={searchQuery} onChange={setSearchQuery} />
                </View>}
                {!isFormVisible && <ScrollView style={styles.scrollView} contentContainerStyle={{ alignItems: 'center' }}>
                    {sites.map((site, index) => (
                        <View style={{ width: '95%' }} key={index}>
                            <TouchableOpacity style={{ width: '100%', alignItems: 'center' }} activeOpacity={0.9} key={index} onPress={() => {
                                setSelectedSite(site);
                                setInfoModalVisible(true);
                            }}>
                                <SiteCard
                                    site={site}
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

                {isFormVisible && <SiteForm
                    changeMode={changeMode}
                    onCancel={() => setIsFormVisible(false)}
                    onSubmit={handleSave}
                    site={selectedSite}
                />}

                {selectedSite && <SiteInfo
                    isVisible={isInfoModalVisible}
                    onClose={() => { setInfoModalVisible(false) }}
                    onEdit={() => { setChangeModel('edit'); setIsFormVisible(true); }}
                    onDelete={handleDelete}
                    site={selectedSite}
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

export default Sites;

