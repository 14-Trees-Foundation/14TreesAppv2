import { View, BackHandler, FlatList, Text, TouchableOpacity, Alert, ScrollView, Modal } from "react-native";
import { Strings } from '../services/Strings';
import { MyIconButton } from '../components/Components';
import React, { useContext, useEffect, useState, useCallback } from "react";
import { commonStyles } from "../services/Styles";
import GlobalContext from "../context/GlobalContext ";
import { CustomDropdown } from "../components/CustomDropdown";
import { Utils } from "../services/Utils";
import { useFocusEffect } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/FontAwesome5';
import CustomModal from "../components/CustomModal";
import { treeFormModes } from "../components/TreeForm";

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
        //const saplingsInShifts = await Utils.getSaplingsInShift();
        //console.log('syncedShiftsFromLiveDB------', syncedShiftsFromLiveDB[0]);
        return syncedShiftsFromLiveDB
    };

    const getCombinedShiftList = async (shiftsIDLocalDB, syncedShiftsFromLiveDB) => {

        let combinedList = [];

        combinedList = [
            ...syncedShiftsFromLiveDB,
            ...shiftsIDLocalDB
        ];

        // if (shiftsIDLocalDB.length > 0) {
        //   combinedList = [
        //     ...syncedShiftsFromLiveDB,
        //     ...shiftsIDLocalDB.map(item => ({ ...item, isSynced: 0 })),
        //   ];
        // } else {
        //   combinedList = [
        //     ...syncedShiftsFromLiveDB
        //   ];
        // }

        setFinalList(combinedList);
        console.log("-------combinedList---------", combinedList)
    };

    const fetchData = async () => {
        const shiftsIDLocalDB = await fetchShiftsFromLocalDB();
        const syncedShiftsFromLiveDB = await fetchLiveShiftsAndSaplings();
        //const syncedShiftsFromLiveDB = [];
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


    const renderData = useCallback((item) => {
        //console.log("item---");
        return (
            <TouchableOpacity style={{ ...commonStyles.borderedDisplay, flex: 1, flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'white', opacity: 0.8, borderRadius: 6 }}
                onPress={() => {
                    navigation.navigate(
                        Strings.screenNames.getString(
                            'TreesInShift',
                            Strings.english,
                        ),
                        {
                            shiftID: item.id, //local treat if live item.shift_id
                            plotselected: item.plotselected,
                            starttime: item.starttime,
                            endtime: item.endtime,
                            timetaken: item.timetaken,
                            treesplanted: item.treesplanted,
                            timestamp: item.timestamp
                        },
                    )
                }}
            >
                <View style={{ flex: 1, flexDirection: 'column', paddingVertical: 8 }}>
                    <Text style={{
                        ...commonStyles.text, color: lightTheme ? '#52525C' : 'black',
                        fontSize: 18, textAlign: 'center'
                    }}
                        numberOfLines={1} // Limit to a single line
                        ellipsizeMode="tail" // Truncate at the end with ellipsis
                    >
                        {item.plotselected}
                    </Text>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: '100%', padding: 4 }}>
                        {/* First View */}

                        <View style={{
                            //flex: 1, 
                            flexDirection: 'column', flexWrap: 'wrap', width: '50%', marginBottom: 1, marginTop: 0,
                            marginLeft: 12
                        }}>
                            <Text style={{
                                ...commonStyles.text, color: lightTheme ? '#52525C' : 'black',
                                fontSize: 14
                            }}>
                                {Strings.labels.Date} : {item.timestamp}
                            </Text>
                            <Text style={{
                                ...commonStyles.text, color: lightTheme ? '#52525C' : 'black',
                                fontSize: 14
                            }}>
                                {Strings.labels.StartTime} :{item.starttime}
                            </Text>
                            <Text style={{
                                ...commonStyles.text, color: lightTheme ? '#52525C' : 'black',
                                fontSize: 14
                            }}>
                                {Strings.labels.EndTime} : {item.endtime}
                            </Text>
                            <Text style={{
                                ...commonStyles.text, color: lightTheme ? '#52525C' : 'black',
                                fontSize: 14
                            }}>
                                {Strings.labels.TimeTaken} :{item.timetaken}
                            </Text>
                        </View>
                        {/* Second View */}

                        <View style={{ ...commonStyles.secondView, backgroundColor: 'lightgrey', marginRight: 2, marginLeft: 22, width: '30%' }}>
                            {/* Icon */}
                            <View style={{ margin: 6, flex: 1, marginTop: 12, marginLeft: 11, marginRight: 12 }}>
                                <View style={{ backgroundColor: 'green', borderRadius: 70, padding: 10, margin: 2 }}>
                                    <Icon name="tree" size={32} color="white" style={{ marginLeft: 5 }} />
                                </View>
                            </View>

                            {/* TreesPlanted */}

                            <View style={{ flex: 1 }}>
                                <Text style={{
                                    color: lightTheme ? '#52525C' : 'black',
                                    fontSize: 28, fontWeight: 'bold', padding: 0, textAlign: 'center', marginRight: 2
                                }}>
                                    {item.treesplanted}
                                </Text>
                            </View>

                        </View>
                    </View>
                </View>


            </TouchableOpacity>
        )
    }, []);

    return (
        <ScrollView keyboardShouldPersistTaps='handled' style={{ marginTop: 0, backgroundColor: "white" }}>

            <CustomModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                mode={mode}
            />



            <View
                style={{
                    marginHorizontal: 50,
                    marginTop: 20,
                    marginBottom: 10
                }}
            >
                <MyIconButton
                    names={['plus', 'tree']}
                    styles={[{ opacity: 0.9 }, { opacity: 0.5 }]}
                    text={Strings.buttonLabels.StartShift}
                    onPress={() => {
                        setModalVisible(true);
                        setMode(treeFormModes.startShift)

                    }}
                />
            </View>


            {
                !modalVisible && <View style={{ backgroundColor: 'white', height: '100%', marginTop: 20 }}>
                    {finalList && finalList.length !== 0 ? (
                        <FlatList
                            style={{ backgroundColor: 'white' }}
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
                                return renderData(item);
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