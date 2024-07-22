import { View, Button, BackHandler, ScrollView, SafeAreaView, StyleSheet, TextInput } from "react-native";
import React, { useContext, useEffect, useState ,useCallback } from "react";
import GlobalContext from "../context/GlobalContext ";

import { DaoClient } from "../services/db/dao";
import PlotsForm from "../components/plots/PlotsForm";
import PlotsCard from "../components/plots/PlotsCard";
import PlotsInfo from "../components/plots/PlotsInfo";
import { TouchableOpacity } from "react-native";
import { CreatePlotRequest, Plot } from "../model/plot";
import { useFocusEffect } from "@react-navigation/native";

interface PlotsInputProps {
    navigation: any
}

const Plots: React.FC<PlotsInputProps> = ({ navigation }) => {

    const { lightTheme } = useContext(GlobalContext);
    const [stateChange, setStateChange] = useState(0);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isInfoModalVisible, setInfoModalVisible] = useState(false);
    const [changeMode, setChangeModel] = useState<'add'  |'edit'>('add');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
    const [plots, setPlots] = useState<Plot[]>([]);

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
        if (searchQuery.length !== 0) return;
        setTimeout(async() => {
            let resp = await  daoClient.plots.getPlots(0, 100);
            setPlots(resp)
        }, 100)
    }, [stateChange, stateChange])

    useEffect(() => {
        if (searchQuery.length < 1) return;
        setTimeout(async() => {
            let plots = await daoClient.plots.searchPlots(searchQuery, 0 ,100);
            setPlots(plots);
        }, 100)
    }, [stateChange, searchQuery])

    const handleSave = (data: Plot | CreatePlotRequest) => {
        setIsFormVisible(false);
        setTimeout(async() => {
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
            setTimeout(async() => {
                await daoClient.plots.deletePlot(selectedPlot.local_id);
                setStateChange(prev => prev + 1);
            }, 1000)
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            { !isFormVisible && <View style={styles.header}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <View style={styles.buttonAdd}>
                    <Button title="Add" onPress={() => {
                        setIsFormVisible(true);
                        setSelectedPlot(null);
                        setChangeModel('add');
                    }} />
                </View>
            </View> }
            {!isFormVisible && <ScrollView contentContainerStyle={styles.scrollView} >
                {plots.map((plot, index) => (
                    <TouchableOpacity style={{ width: '100%' }} key={index} onPress={() => {
                        setSelectedPlot(plot);
                        setInfoModalVisible(true);
                    }}>
                        <PlotsCard plot={plot} />
                    </TouchableOpacity>
                ))}
            </ScrollView> }

            {isFormVisible && <PlotsForm
                changeMode={changeMode}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleSave}
                plot={selectedPlot}
            />}
            
            { selectedPlot && <PlotsInfo
                isVisible={isInfoModalVisible}
                onClose={() => { setInfoModalVisible(false) }}
                onEdit={() => { setChangeModel('edit'); setIsFormVisible(true); }}
                onDelete={handleDelete}
                plot={selectedPlot}
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

