import { View, BackHandler, FlatList, Text, TouchableOpacity, Alert, ScrollView, Modal, StyleSheet } from "react-native";
import { Strings } from '../services/Strings';
import { StackedIcons } from '../components/Components';
import React, { useContext, useEffect, useState, useCallback } from "react";
import { commonStyles, shiftsStyles } from "../services/Styles";
import GlobalContext from "../context/GlobalContext ";
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Utils } from "../services/Utils";
import { useFocusEffect } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/FontAwesome5';
import CustomModal from "../components/CustomModal";
import { treeFormModes } from "../components/TreeForm";
import { Button } from 'react-native-paper';
import { Iconstyles } from "../services/Styles";
import { Card } from 'react-native-paper';
import ShiftsCard from "../components/ShiftsCard";

const Shifts = ({ navigation }) => {

    const [finalList, setFinalList] = useState(null);
    const { lightTheme } = useContext(GlobalContext);

    const [modalVisible, setModalVisible] = useState(false);
    const [mode, setMode] = useState(null);

    const fetchShiftsFromLocalDB = async () => {
        const shiftsIDLocalDB = await Utils.getShiftsIDLocalDB();
        //console.log('---local shift------', shiftsIDLocalDB[0]);
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

        //console.log("-------combinedList---------", combinedList)
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
            //console.log('closing modal in shifts----');
            navigation.goBack();
            return true; // Prevent default behavior (exit app)
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove(); // Remove event listener on cleanup


    }, []);



    return (
        <ScrollView keyboardShouldPersistTaps='handled' style={shiftsStyles.scrollView}>

            <CustomModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                mode={mode}
            />

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
                        setModalVisible(true);
                        setMode(treeFormModes.startShift)

                    }}
                    contentStyle={Iconstyles.buttonContent}
                    labelStyle={Iconstyles.buttonLabel}
                >
                    {Strings.buttonLabels.StartShift}

                </Button>
            </View>


            {
                !modalVisible && <View style={shiftsStyles.shiftsView}>
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
            }

        </ScrollView>
    )
}

export default Shifts;

