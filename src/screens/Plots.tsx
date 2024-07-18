import { View, Button, BackHandler, ScrollView, SafeAreaView, StyleSheet, TextInput } from "react-native";
import React, { useContext, useEffect, useState ,useCallback } from "react";
import GlobalContext from "../context/GlobalContext ";

import { DaoClient } from "../services/db/dao";
import { PlotsClient } from "../services/api/plots";
import { LocalDatabase } from "../services/db/db";
import PlotsForm from "../components/plots/PlotsForm";
import PlotsCard from "../components/plots/PlotsCard";
import PlotsInfo from "../components/plots/PlotsInfo";
import { TouchableOpacity } from "react-native";
import { CreatePlotRequest, Plots } from "../model/plots";
import { useFocusEffect } from "@react-navigation/native";

interface PlotsInputProps {
    navigation: any
}

const Plots = ({ navigation }) => {

    const { lightTheme } = useContext(GlobalContext);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isInfoModalVisible, setInfoModalVisible] = useState(false);
    const [changeMode, setChangeModel] = useState('add');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlot, setSelectedPlo] = useState(null);
    const [page, setPage] = useState(0);
    const [plots, setPlots] = useState([]);



    

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
        setTimeout(async() => {
            let resp = await  daoClient.plots.getLocalPlots(page*10, 10);
            if (page != 0) setPlots([...plots, ...resp]);
            else setPlots(resp)
            console.log(resp);
        }, 1000)
    }, [page])

    useEffect(() => {
        if (searchQuery.length < 3) return;
        setTimeout(async() => {
            let plots = await daoClient.searchPlots(searchQuery);
            setPlots(plots);
        }, 1000)
    }, [searchQuery])

    const handleSave = (data) => {
        setTimeout(async() => {
            if (changeMode === 'add') await daoClient.plots.createLocalUser(data);
            else await daoClient.plots.updateLocalPlot(data);

            setPage(0);
        }, 1000)

    };

    const handleDelete = () => {
        if (selectedPlot) {
            setTimeout(async() => {
                await daoClient.plots.deleteLocalUser(selectedPlot);
                setPage(0);
            }, 1000)
        }
    }

    const filteredPlots = plots.filter(plot =>
        plot.name.toLowerCase().includes(searchQuery.toLowerCase()) 
       
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
                        <PlotsCard plot={plot} />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <PlotsForm
                mode={changeMode}
                isVisible={isFormVisible}
                onClose={() => setIsFormVisible(false)}
                onSave={handleSave}
                user={selectedUser}
            />
            
            { selectedUser && <PlotsInfo
                isVisible={isInfoModalVisible}
                onClose={() => { setInfoModalVisible(false) }}
                onEdit={() => { setChangeModel('edit'); setIsFormVisible(true); }}
                onDelete={handleDelete}
                user={selectedUser}
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

export default Plots;

