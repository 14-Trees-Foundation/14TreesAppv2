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

    const [shifts, setShifts] = useState(0);
    const [finalList, setFinalList] = useState(null);
    const { lightTheme } = useContext(GlobalContext);

    const [modalVisible, setModalVisible] = useState(false);
    const [mode, setMode] = useState(null);

    const fetchShiftsFromLocalDB = async () => {
        const shiftsIDDB = await Utils.getShiftsIDLocalDB();
        //console.log("all shifts------", shiftsIDDB, shiftsIDDB.length);
        setShifts(shiftsIDDB.length);
        setFinalList(shiftsIDDB);
    }

    useFocusEffect(
        React.useCallback(() => {
            fetchShiftsFromLocalDB();
            //loadDataCallback();
        }, []),
    );



    useEffect(() => {
        const backAction = () => {
            console.log('closing modal in shifts----');
            navigation.goBack();
            return true; // Prevent default behavior (exit app)
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove(); // Remove event listener on cleanup


    }, []);


    const renderData = useCallback((item) => {
        //console.log("yd render render shiftss----");
        return (
            <TouchableOpacity style={{ ...commonStyles.borderedDisplay, flex: 1, flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'white', opacity: 0.8, borderRadius: 6 }}
                onPress={() => {
                    navigation.navigate(
                        Strings.screenNames.getString(
                            'TreesInShift',
                            Strings.english,
                        ),
                        {
                            shiftID: item.shiftID,
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
                <View style={{ flex: 1, flexDirection: 'column' }}>
                    <Text style={{
                        ...commonStyles.text, color: lightTheme ? '#52525C' : 'black',
                        fontSize: 18, textAlign: 'center'
                    }}>
                        {item.plotselected}
                    </Text>

                    <View style={{ flex: 1, flexDirection: 'row', marginTop: 12 }}>
                        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-around', width: '70%', marginLeft: 12 }}>

                            <Text style={{
                                ...commonStyles.text, color: lightTheme ? '#52525C' : 'black',
                                fontSize: 12
                            }}>
                                {Strings.labels.Date} : {item.timestamp}
                            </Text>
                            <Text style={{
                                ...commonStyles.text, color: lightTheme ? '#52525C' : 'black',
                                fontSize: 12
                            }}>
                                {Strings.labels.StartTime} :{item.starttime}
                            </Text>
                            <Text style={{
                                ...commonStyles.text, color: lightTheme ? '#52525C' : 'black',
                                fontSize: 12
                            }}>
                                {Strings.labels.EndTime} : {item.endtime}
                            </Text>
                            <Text style={{
                                ...commonStyles.text, color: lightTheme ? '#52525C' : 'black',
                                fontSize: 12
                            }}>
                                {Strings.labels.TimeTaken} :{item.timetaken}
                            </Text>
                        </View>


                        <View style={{ ...commonStyles.secondView, backgroundColor: 'lightgrey', marginRight: 20, marginLeft: 22, width: '30%' }}>
                            {/* Icon */}
                            <View style={{ margin: 6, flex: 1 }}>
                                <View style={{ backgroundColor: 'green', borderRadius: 70, padding: 10, margin: 2 }}>
                                    <Icon name="tree" size={32} color="white" style={{ marginLeft: 5 }} />
                                </View>
                            </View>

                            {/* TreesPlanted */}

                            <View style={{ flex: 1 }}>
                                <Text style={{
                                    color: lightTheme ? '#52525C' : 'black',
                                    fontSize: 18, fontWeight: 'bold', padding: 10, textAlign: 'center'
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
        <ScrollView keyboardShouldPersistTaps='handled' style={{ marginTop: 10, backgroundColor: "white" }}>

            <CustomModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                mode={mode}
                shift_ID={Utils.getShiftID(shifts)}
            />



            <View
                style={{
                    marginHorizontal: 50,
                    marginTop: 15,
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
                    {shifts === 0 ? (
                        <View style={{ ...commonStyles.borderedDisplay }}>
                            <Text style={{ ...commonStyles.text5, color: lightTheme ? '#52525C' : 'black' }}>
                                {Strings.messages.NoShiftsFound}
                            </Text>
                        </View>
                    ) : (

                        <FlatList
                            style={{ backgroundColor: 'white' }}
                            ListHeaderComponent={() => (
                                <View style={{ ...commonStyles.borderedDisplay }}>
                                    <Text style={{ ...commonStyles.text5, color: lightTheme ? '#52525C' : 'black', }}>
                                        {Strings.messages.AllShifts}
                                    </Text>
                                </View>
                            )}
                            data={finalList}
                            scrollEnabled={false}
                            renderItem={({ item }) => {
                                return renderData(item);
                            }}
                        />
                    )}
                </View>
            }

        </ScrollView>
    )
}

export default Shifts;