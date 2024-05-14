import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { FlatList, Text, TouchableOpacity, View, Alert, ScrollView, BackHandler, ToastAndroid } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MyIconButton } from '../components/Components';
import { Strings } from '../services/Strings';
import { Utils } from '../services/Utils';
import { commonStyles } from '../services/Styles';
import GlobalContext from '../context/GlobalContext ';
import ShiftHeader from '../components/ShiftHeader';
import CustomModal from '../components/CustomModal';
import { treeFormModes } from '../components/TreeForm';
import LoadingScreen from './LoadingScreen';


const Shift = ({ navigation, route }) => {
    const { plotSelected, treesPlanted, setTreesPlanted, setShiftDone, setPlotSelected, shiftTime, shiftID, setShiftID, lightTheme } = useContext(GlobalContext);
    //const { shiftID } = route.params;

    const [finalList, setFinalList] = useState(null);


    const [modalVisible, setModalVisible] = useState(false);
    const [mode, setMode] = useState(null);
    const [saplingID, setSaplingID] = useState(null);
    //const [getTimer, setGetTimer] = useState(false);

    const finalRef = useRef({ shiftID: null, shiftTime: null, seconds: null, treesPlanted: 0, plotselected: null });
    finalRef.current.shiftTime = shiftTime;
    //finalRef.current.seconds = seconds;
    finalRef.current.treesPlanted = treesPlanted;
    finalRef.current.plotselected = plotSelected ? plotSelected.name : null;
    finalRef.current.shiftID = shiftID,

        useEffect(() => {
            const backAction = () => {
                Alert.alert(
                    Strings.alertMessages.FinishShift,
                    "",
                    [
                        {
                            text: "No",
                            onPress: () => null,
                            style: "cancel"
                        },
                        {
                            text: "Yes",
                            onPress: () => { handleChanges() }
                        }
                    ]
                );


                return true;
            };

            const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

            return () => backHandler.remove(); // Remove event listener on cleanup


        }, []);

    useEffect(() => {
        console.log("shiftID inside shift------", shiftID);
    }, [shiftID])

    const fetchTreesFromLocalDB = () => {
        Utils.fetchTreesFromLocalDB().then(trees => {
            let finalListForShift = trees.filter(tree => tree.shiftID === shiftID);

            finalListForShift.sort((a, b) => {
                if (a.uploaded && !b.uploaded) {
                    return 1; // Move uploaded trees to the end
                }
                if (!a.uploaded && b.uploaded) {
                    return -1; // Keep non-uploaded trees before uploaded trees
                }
                return 0; // Maintain the original order
            });

            setFinalList(finalListForShift);
            console.log('setting both lists to: ', finalListForShift, finalListForShift.length);
        });
    };

    //useEffect(() =>)
    useFocusEffect(
        useCallback(() => {
            console.log('focus');
            fetchTreesFromLocalDB();
        }, []),
    );


    const handleChanges = async () => {

        const endtime = Utils.getCurrentTime12Hr();
        const timetaken = Utils.formatTime(finalRef.current.seconds);
        const user_id = await Utils.getUserId();

        // console.log("shifttime----, ", finalRef.current.shiftTime);
        // console.log("timetaken----", finalRef.current.seconds);
        // console.log("treesplanted----", finalRef.current.treesPlanted);
        // console.log("plotselected----", finalRef.current.plotselected);
        // console.log("shiftid----", finalRef.current.shiftID);

        const shiftData = {
            shiftID: finalRef.current.shiftID,
            user_id: user_id,
            plotselected: finalRef.current.plotselected,
            starttime: finalRef.current.shiftTime,
            endtime: endtime,
            timetaken: timetaken,
            treesplanted: finalRef.current.treesPlanted
        }

        console.log("final shift data---", shiftData);

        await Utils.saveShiftsToLocalDB(shiftData);

        navigation.navigate(
            Strings.screenNames.getString('Shifts', Strings.english)
        )
        setTreesPlanted(0);
        setPlotSelected(null);
        setShiftDone(true);
        setShiftID(null);
    }

    const RenderHeader2 = () => {

        return (
            <View style={{ backgroundColor: "white", padding: 2, margin: 4, borderRadius: 10, borderColor: '#ccc', borderWidth: 3 }}>
                <View style={{ margin: 2 }}>
                    <MyIconButton
                        names={['plus', 'tree']}
                        styles={[{ opacity: 0.9 }, { opacity: 0.5 }]}
                        text={Strings.buttonLabels.AddNewTree}
                        onPress={() => {
                            setMode(treeFormModes.addTree);
                            setModalVisible(true);
                            setSaplingID(null);
                        }}
                    />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                    <View style={{ width: '53%' }}>
                        <MyIconButton
                            name={"wifi-sync"}
                            text={Strings.buttonLabels.SyncData}
                            onPress={() => {
                                // setModalVisible(true);
                                // setMode(treeFormModes.showSync);

                                navigation.navigate(
                                    Strings.screenNames.getString('SyncDisplay', Strings.english),
                                    { data: finalRef }
                                )
                            }}
                        />
                    </View>

                    <View style={{ width: '47%' }}>
                        <MyIconButton
                            name={'check'}
                            size={29}
                            text={Strings.buttonLabels.Done}
                            onPress={handleChanges}
                        />
                    </View>
                </View>


            </View>
        );
    };

    // console.log("rendered shift screen");

    const renderTree = useCallback((tree1, tree2, tree3, tree4) => {
        //console.log("upload:--", tree1.uploaded);
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', backgroundColor: 'white', margin: 2, borderRadius: 6 }}>
                {/* First Tree */}
                {tree1 ? tree1.uploaded ? (
                    <View style={{ ...commonStyles.borderedDisplay2, backgroundColor: '#059636', flex: 1, justifyContent: 'space-around', width: '25%' }}>
                        <TouchableOpacity
                            onPress={() => {
                                ToastAndroid.show(Strings.alertMessages.Synched, ToastAndroid.SHORT);
                            }}
                        >
                            <Text style={{ ...commonStyles.text, color: 'white', fontWeight: '600', textAlign: 'center' }}>
                                {tree1.sapling_id}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) :
                    (<View style={{ ...commonStyles.borderedDisplay, flex: 1, justifyContent: 'space-around', width: '25%' }}>
                        <TouchableOpacity onPress={() => {
                            setMode(treeFormModes.localEdit);
                            setSaplingID(tree1.sapling_id);
                            setModalVisible(true);
                        }}>
                            <Text style={{ ...commonStyles.text, color: lightTheme ? '#52525C' : 'black', textAlign: 'center' }}>
                                {tree1.sapling_id}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    ) : <View style={{ justifyContent: 'space-around', width: '25%' }}></View>
                }

                {/* Second Tree */}
                {tree2 ? tree2.uploaded ? (
                    <View style={{ ...commonStyles.borderedDisplay2, backgroundColor: '#059636', flex: 1, justifyContent: 'space-around', width: '25%' }}>
                        <TouchableOpacity
                            onPress={() => {
                                ToastAndroid.show(Strings.alertMessages.Synched, ToastAndroid.SHORT);
                            }}
                        >
                            <Text style={{ ...commonStyles.text, color: 'white', fontWeight: '600', textAlign: 'center' }}>
                                {tree2.sapling_id}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (<View style={{ ...commonStyles.borderedDisplay, flex: 1, justifyContent: 'space-around', width: '25%' }}>
                    <TouchableOpacity onPress={() => {
                        setMode(treeFormModes.localEdit);
                        setSaplingID(tree2.sapling_id);
                        setModalVisible(true);
                    }}>
                        <Text style={{ ...commonStyles.text, color: lightTheme ? '#52525C' : 'black', textAlign: 'center' }}>
                            {tree2.sapling_id}
                        </Text>
                    </TouchableOpacity>
                </View>
                ) : <View style={{ justifyContent: 'space-around', width: '25%' }}></View>
                }

                {/* Third Tree */}
                {tree3 ? tree3.uploaded ? (
                    <View style={{ ...commonStyles.borderedDisplay2, backgroundColor: '#059636', flex: 1, justifyContent: 'space-around', width: '25%' }}>
                        <TouchableOpacity
                            onPress={() => {
                                ToastAndroid.show(Strings.alertMessages.Synched, ToastAndroid.SHORT);
                            }}
                        >
                            <Text style={{ ...commonStyles.text, color: 'white', fontWeight: '600', textAlign: 'center' }}>
                                {tree3.sapling_id}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (<View style={{ ...commonStyles.borderedDisplay, flex: 1, justifyContent: 'space-around', width: '25%' }}>
                    <TouchableOpacity onPress={() => {
                        setMode(treeFormModes.localEdit);
                        setSaplingID(tree3.sapling_id);
                        setModalVisible(true);
                    }}>
                        <Text style={{ ...commonStyles.text, color: lightTheme ? '#52525C' : 'black', textAlign: 'center' }}>
                            {tree3.sapling_id}
                        </Text>
                    </TouchableOpacity>
                </View>
                ) : <View style={{ justifyContent: 'space-around', width: '25%' }}></View>
                }

                {/* Fourth Tree */}

                {tree4 ? tree4.uploaded ? (
                    <View style={{ ...commonStyles.borderedDisplay2, backgroundColor: '#059636', flex: 1, justifyContent: 'space-around', width: '25%' }}>
                        <TouchableOpacity
                            onPress={() => {
                                ToastAndroid.show(Strings.alertMessages.Synched, ToastAndroid.SHORT);
                            }}
                        >
                            <Text style={{ ...commonStyles.text, color: 'white', fontWeight: '600', textAlign: 'center' }}>
                                {tree4.sapling_id}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (<View style={{ ...commonStyles.borderedDisplay, flex: 1, justifyContent: 'space-around', width: '25%' }}>
                    <TouchableOpacity onPress={() => {
                        setMode(treeFormModes.localEdit);
                        setSaplingID(tree4.sapling_id);
                        setModalVisible(true);
                    }}>
                        <Text style={{ ...commonStyles.text, color: lightTheme ? '#52525C' : 'black', textAlign: 'center' }}>
                            {tree4.sapling_id}
                        </Text>
                    </TouchableOpacity>
                </View>
                ) : <View style={{ justifyContent: 'space-around', width: '25%' }}></View>
                }
            </View>
        )
    }, []);

    const handleModalChanges = () => {
        setMode(treeFormModes.plotSelect);
        setModalVisible(true);
    }

    //final return
    if (finalList === null) {
        return (
            <LoadingScreen />
        )
    } else {
        return (
            <ScrollView keyboardShouldPersistTaps='handled' style={{ backgroundColor: 'white', height: '100%', marginTop: 0 }}>

                <View style={{ flex: 1, marginTop: 10 }}>
                    <ShiftHeader navigation={navigation}
                        onSetTime={(seconds) => {
                            //console.log('secondsfrom timer----', seconds);
                            finalRef.current.seconds = seconds;
                        }}
                        handleModalChanges={handleModalChanges}
                    />

                    {!modalVisible && <RenderHeader2 />}

                    <CustomModal
                        modalVisible={modalVisible}
                        setModalVisible={setModalVisible}
                        mode={mode}
                        onFetchData={fetchTreesFromLocalDB}
                        saplingID={saplingID}
                    />
                </View>


                {
                    !modalVisible && <View style={{ margin: 2, borderColor: '#5DB075', borderRadius: 5, flexDirection: 'row', backgroundColor: 'white' }}>
                        <FlatList
                            style={{ flex: 1, backgroundColor: 'white' }}
                            scrollEnabled={false}
                            ListEmptyComponent={() => (
                                <View style={commonStyles.borderedDisplay}>
                                    <Text style={{ ...commonStyles.text5, color: lightTheme ? '#52525C' : 'black', }}>
                                        {Strings.messages.NoTreesFound}
                                    </Text>
                                </View>
                            )}
                            data={finalList}

                            renderItem={({ item, index }) => {
                                if (index % 4 === 0) {

                                    if (index + 3 < finalList.length) {
                                        return renderTree(item, finalList[index + 1], finalList[index + 2], finalList[index + 3])
                                    } else if (index + 2 < finalList.length) {
                                        return renderTree(item, finalList[index + 1], finalList[index + 2], null);
                                    } else if (index + 1 < finalList.length) {
                                        return renderTree(item, finalList[index + 1], null, null);
                                    } else {
                                        return renderTree(item, null, null, null)
                                    }
                                }
                            }}
                        />
                    </View>
                }

            </ScrollView>
        );
    }



}

export default Shift;