import { View, BackHandler, SafeAreaView, StyleSheet } from "react-native";
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
import CardList from "../components/CardList";


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

    const [sitesPage, setSitesPage] = useState(0);
    const [hasMoreSites, setHasMoreSites] = useState(true);

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

        const getSites = async () => {
            const daoClient = await DaoClient.authenticate();
            let resp = await daoClient.sites.searchSites(searchQuery, 0, 10);
            const newSites = sitesPage === 0 ? resp : [...sites, ...resp];
    
            // Filter out duplicates based on site.local_id
            const uniqueSites = newSites.filter((site, index, self) => 
                index === self.findIndex((t) => t.local_id === site.local_id)
            );
    
            setSites(uniqueSites);
            setHasMoreSites(resp.length === 10);
        }

        getSites();
    }, [sitesPage, searchQuery, stateChange])

    useEffect(() => {
        if (searchQuery.length !== 0) return;

        const getSites = async () => {
            const daoClient = await DaoClient.authenticate();
            let resp = await daoClient.sites.getSites(0, 10);
            const newSites = sitesPage === 0 ? resp : [...sites, ...resp];
    
            // Filter out duplicates based on site.local_id
            const uniqueSites = newSites.filter((site, index, self) => 
                index === self.findIndex((t) => t.local_id === site.local_id)
            );
    
            setSites(uniqueSites);
            setHasMoreSites(resp.length === 10);
        }

        getSites();
    }, [sitesPage, searchQuery, stateChange])

    const handleSave = (data: Site | CreateSiteRequest) => {

        const saveSite = async () => {
            const daoClient = await DaoClient.authenticate();
            if (changeMode === 'add') {
                let request = JSON.parse(JSON.stringify(data)) as CreateSiteRequest;
                await daoClient.sites.createSite(request)
            } else {
                let request = JSON.parse(JSON.stringify(data)) as Site;
                await daoClient.sites.updateSite(request)
            };

            setStateChange(prev => prev + 1);
        }

        saveSite();
    };

    const handleDelete = () => {

        const deleteSite = async () => {
            if (selectedSite) {
                const daoClient = await DaoClient.authenticate();
                await daoClient.sites.deleteSite(selectedSite.local_id);
                setStateChange(prev => prev + 1);
            }
        }

        deleteSite();
    }

    const renderSiteItem = (site: Site, index: number) => {
        return (
            <View style={{ width: '100%', paddingHorizontal: 10 }} key={index}>
                <TouchableOpacity style={{ width: '100%', alignItems: 'center' }} activeOpacity={0.9} key={index} onPress={() => {
                    setSelectedSite(site);
                    setInfoModalVisible(true);
                }}>
                    <SiteCard
                        site={site}
                    />
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <InternetBanner />
            <SafeAreaView style={styles.safeArea}>
                {!isFormVisible && <View style={styles.header}>
                    <SearchBar query={searchQuery} onChange={(text: string) => { setSitesPage(0); setSearchQuery(text) }} />
                </View>}
                {!isFormVisible && <CardList 
                    data={sites}
                    renderItem={renderSiteItem}
                    pagination
                    onEndReached={() => setSitesPage(prev => prev + 1)}
                    hasMore={hasMoreSites}
                />}
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

