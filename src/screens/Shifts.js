import { View, BackHandler, FlatList, Text, TouchableOpacity, Alert, ScrollView, Modal, StyleSheet } from "react-native";
import { Strings } from '../services/Strings';
import { StackedIcons } from '../components/Components';
import React, { useContext, useEffect, useState, useCallback } from "react";
import { commonStyles, shiftsStyles } from "../services/Styles";
import GlobalContext from "../context/GlobalContext ";
import { Utils } from "../services/Utils";
import { useFocusEffect } from "@react-navigation/native";
import { treeFormModes } from "../components/TreeForm";
import { Button } from 'react-native-paper';
import { Iconstyles } from "../services/Styles";
import ShiftsCard from "../components/ShiftsCard";
import { ShiftTypeModal } from "../components/ShiftTypeModal";
import PlotSelectModal from "../components/PlotSelectModal";
import UpdatePlotSelectModal from "../components/UpdatePlotSelectModal";

export const shiftTypes = {
    addSapling: 0,
    addImage: 1,
    updatePlot: 2
}

const Shifts = ({ navigation }) => {

    const [finalList, setFinalList] = useState(null);
    const { lightTheme } = useContext(GlobalContext);

    const [shiftModalVisible, setShiftModalVisible] = useState(false);
    const [mode, setMode] = useState(null);
    const [plotModalVisible, setPlotModalVisible] = useState(false);
    const [updatePlotModalVisible, setUpdatePlotModalVisible] = useState(false);

    const fetchShiftsFromLocalDB = async () => {
        const shiftsIDLocalDB = await Utils.getShiftsIDLocalDB();
        return shiftsIDLocalDB
    };

    const fetchLiveShiftsAndSaplings = async () => {
        const syncedShiftsFromLiveDB = await Utils.getShiftsLive();

        return syncedShiftsFromLiveDB
    };

    const getCombinedShiftList = async (shiftsIDLocalDB, syncedShiftsFromLiveDB) => {

        let combinedList = [];

        combinedList = [
            ...syncedShiftsFromLiveDB,
            ...shiftsIDLocalDB
        ];

        combinedList.sort((a, b) => {
            if ((a.shiftuploadcomplete == 1) && (b.shiftuploadcomplete == 0)) {
                return 1; // Move uploaded trees to the end
            }
            if ((a.shiftuploadcomplete == 0) && (b.shiftuploadcomplete == 1)) {
                return -1; // Keep non-uploaded trees before uploaded trees
            }
            return 0; // Maintain the original order
        });

        setFinalList(combinedList);
    };

    const fetchData = async () => {
        const shiftsIDLocalDB = await fetchShiftsFromLocalDB();
        const syncedShiftsFromLiveDB = await fetchLiveShiftsAndSaplings();
        await getCombinedShiftList(shiftsIDLocalDB, syncedShiftsFromLiveDB);
    };


    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, []),
    );


    useEffect(() => {
        const backAction = () => {
            navigation.goBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();


    }, []);

    return (
        <ScrollView keyboardShouldPersistTaps='handled' style={shiftsStyles.scrollView}>

            <ShiftTypeModal     
                shiftModalVisible={shiftModalVisible}
                setShiftModalVisible={setShiftModalVisible}
                onShiftModalClose={() => setPlotModalVisible(true)}
                onUpdatePlotModalClose={() => setUpdatePlotModalVisible(true)}
            />

            <PlotSelectModal
                plotModalVisible={plotModalVisible}
                setPlotModalVisible={setPlotModalVisible}
                mode={mode}
            />

            <UpdatePlotSelectModal
                updatePlotModalVisible={updatePlotModalVisible}
                setUpdatePlotModalVisible={setUpdatePlotModalVisible}
                mode={mode}
            />

            {!shiftModalVisible && !plotModalVisible && !updatePlotModalVisible &&

                (
                    <>
                        <View style={shiftsStyles.buttonContainer}>
                            <Button
                                icon={() => (
                                    <View style={Iconstyles.buttonPosition}>
                                        <StackedIcons
                                            names={['plus', 'tree']}
                                            styles={[{ opacity: 0.9, position: 'absolute' }, { opacity: 0.5, position: 'absolute' }]}
                                        />
                                    </View>
                                )}
                                mode="contained"
                                buttonColor='#059636'
                                onPress={() => {
                                    setShiftModalVisible(true); //when this is true then Custommodal is visible
                                    setMode(treeFormModes.startShift)
                                }}
                                contentStyle={Iconstyles.buttonContent}
                                labelStyle={Iconstyles.buttonLabel}
                            >
                                {Strings.buttonLabels.StartShift}

                            </Button> 
                        </View>

                        <View style={shiftsStyles.shiftsView}>
                            {finalList && finalList.length !== 0 ? (
                                <FlatList
                                    style={shiftsStyles.flatList}
                                    ListHeaderComponent={() => (
                                        <View style={{ ...commonStyles.borderedDisplay }}>
                                            <Text style={{ ...commonStyles.text5, color: lightTheme ? '#52525C' : 'black', }}>
                                                {Strings.messages.AllShifts}
                                            </Text>
                                        </View>
                                    )}
                                    keyExtractor={(item) => item.id ? item.id.toString() : item.shift_id.toString()}
                                    data={finalList}
                                    scrollEnabled={false}
                                    renderItem={({ item }) => {
                                        return (
                                            <ShiftsCard item={item} />
                                        );
                                    }}
                                />
                            ) : (
                                <View style={{ ...commonStyles.borderedDisplay }}>
                                    <Text style={{ ...commonStyles.text5, color: lightTheme ? '#52525C' : 'black' }}>
                                        {Strings.messages.NoShiftsFound}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </>
                )
            }
        </ScrollView>
    )
}

export default Shifts;