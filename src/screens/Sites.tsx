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


interface SitesInputProps {
    navigation: any
}


const Sites: React.FC<SitesInputProps> = ({ navigation })  => {

    const { lightTheme } = useContext(GlobalContext);
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

    const handleSave = (data: Site| CreateSiteRequest) => {
        setTimeout(async() => {
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
            setTimeout(async() => {
                await daoClient.sites.deleteSite(selectedSite.local_id);
            }, 1000)
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <View style={styles.buttonAdd}>
                    <Button title="Add" onPress={() => {
                        setIsFormVisible(true);
                        setChangeModel('add');
                    }} />
                </View>
            </View>
            <ScrollView contentContainerStyle={styles.scrollView} >
                {sites.map((site, index) => (
                    <TouchableOpacity style={{ width: '100%' }} key={index} onPress={() => {
                        setSelectedSite(site);
                        setInfoModalVisible(true);
                    }}>
                        <SiteCard site={site} />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {isFormVisible && <SiteForm
                changeMode={changeMode}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleSave}
                site={selectedSite}
            />}
            
            { selectedSite && <SiteInfo
                isVisible={isInfoModalVisible}
                onClose={() => { setInfoModalVisible(false) }}
                onEdit={() => { setChangeModel('edit'); setIsFormVisible(true); }}
                onDelete={handleDelete}
                site={selectedSite}
            />}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        height: 80,
    },
    searchInput: {
        flex: 1,
        width: '80%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
    },
    buttonAdd: {
        width: '20%',
        height: '100%',
        justifyContent: 'center'
    },
    scrollView: {
        flexGrow: 1,
        padding: 5,
        alignItems: 'center',
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
});

export default Sites;

