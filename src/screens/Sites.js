import { View, Button, BackHandler, ScrollView, SafeAreaView, StyleSheet, TextInput } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import GlobalContext from "../context/GlobalContext ";
import { SitesClient } from "../services/api/sites";
import { LocalDatabase } from "../services/db/db";
import SiteFormModal from "../components/sites/SitesFormModal";
import SiteCard from "../components/sites/SitesCard";
import SiteInfo from "../components/sites/SitesInfo";
import { TouchableOpacity } from "react-native";

const Sites = ({ navigation }) => {

    const { lightTheme } = useContext(GlobalContext);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isInfoModalVisible, setInfoModalVisible] = useState(false);
    const [changeMode, setChangeModel] = useState('add');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSite, setSelectedSite] = useState(null);
    const [page, setPage] = useState(0);
    const [site, setSite] = useState([]);

    const apiClient = new SitesClient();
    let localClient;
    LocalDatabase.authenticate().then((client) => { localClient = client; });

    useEffect(() => {
        const backAction = () => {
            navigation.goBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        setTimeout(async() => {
            let resp = await localClient.users.getLocalUsers(page*10, 10);
            if (page != 0) setUsers([...users, ...resp]);
            else setUsers(resp)
            console.log(resp);
        }, 1000)
    }, [page])

    useEffect(() => {
        if (searchQuery.length < 3) return;
        setTimeout(async() => {
            let users = await apiClient.searchUsers(searchQuery);
            setUsers(users);
        }, 1000)
    }, [searchQuery])

    const handleSave = (data) => {
        setTimeout(async() => {
            if (changeMode === 'add') await localClient.users.createLocalUser(data);
            else await localClient.users.updateLocalUser(data);

            setPage(0);
        }, 1000)

    };

    const handleDelete = () => {
        if (selectedUser) {
            setTimeout(async() => {
                await localClient.users.deleteLocalUser(selectedUser);
                setPage(0);
            }, 1000)
        }
    }

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                {filteredUsers.map((user, index) => (
                    <TouchableOpacity style={{ width: '100%' }} key={index} onPress={() => {
                        setSelectedUser(user);
                        setInfoModalVisible(true);
                    }}>
                        <SiteCard site={site} />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <SiteFormModal
                mode={changeMode}
                isVisible={isFormVisible}
                onClose={() => setIsFormVisible(false)}
                onSave={handleSave}
                site={selectedSite}
            />
            
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

