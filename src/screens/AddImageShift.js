import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { FlatList, Text, TouchableOpacity, View, Alert, ScrollView, BackHandler, ToastAndroid } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackedIcons } from '../components/Components';
import { Strings } from '../services/Strings';
import { Utils } from '../services/Utils';
import { Iconstyles, commonStyles, shiftStyles } from '../services/Styles';
import GlobalContext from '../context/GlobalContext ';
import ShiftHeader from '../components/ShiftHeader';
import { TreeForm, treeFormModes } from '../components/TreeForm';
import LoadingScreen from './LoadingScreen';
import { Button } from 'react-native-paper';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TreeRow } from '../components/TreeRow';
import { AddImageModal } from '../components/AddImageModal';

const AddImageShift = ({ navigation }) => {
    const { plotSelected, treesPlanted, setTreesPlanted, setShiftDone, setPlotSelected, shiftTime, shiftID, setShiftID, lightTheme } = useContext(GlobalContext);

    const [finalList, setFinalList] = useState(null);


    const [modalVisible, setModalVisible] = useState(false);
    const [mode, setMode] = useState(null);
    const [saplingID, setSaplingID] = useState(null);

    const finalRef = useRef({ shiftTime: null, seconds: null, treesPlanted: 0, plotselected: null });
    finalRef.current.shiftTime = shiftTime;
    finalRef.current.treesPlanted = treesPlanted;
    finalRef.current.plotselected = plotSelected ? plotSelected.name : null;

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
                        onPress: () => { saveShiftToDB() }
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

    const fetchSaplingsForShift = async () => {
        const saplingsForShift = await Utils.fetchSaplingsFromLocalShiftDB(shiftID);

        saplingsForShift.sort((a, b) => {
            if (a.uploaded && !b.uploaded) {
                return 1; // Move uploaded trees to the end
            }
            if (!a.uploaded && b.uploaded) {
                return -1; // Keep non-uploaded trees before uploaded trees
            }
            return 0; // Maintain the original order
        });

        setFinalList(saplingsForShift);
        console.log('setting both lists to: ', saplingsForShift, saplingsForShift.length);
    };


    useFocusEffect(
        useCallback(() => {
            console.log('focus');
            fetchSaplingsForShift();
        }, []),
    );


    const saveShiftToDB = async () => {
        if (finalList && finalList.length > 0) {
            const endtime = Utils.getCurrentTime12Hr();
            const timetaken = Utils.formatTime(finalRef.current.seconds);
            const user_id = await Utils.getUserId();
            let uploadedShift = true;

            for (let index = 0; index < finalList.length; index++) {
                let tree = finalList[index];
                if (tree.uploaded === false) {
                    uploadedShift = false;
                    break;
                }
            }

            const shiftData = {
                id: shiftID,
                user_id: user_id,
                plotselected: finalRef.current.plotselected,
                starttime: finalRef.current.shiftTime,
                endtime: endtime,
                shiftended: 1, //made it 1
                shiftuploadcomplete: uploadedShift ? 1 : 0,
                timetaken: timetaken,
                treesplanted: finalRef.current.treesPlanted,
            }

            console.log("final shift data---", shiftData);

            await Utils.saveShiftsToLocalDB(shiftData);
        } else {
            //delete the shift from db.
            console.log("final list----", finalList);
            await Utils.deleteShiftLocalDB(shiftID);
        }

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
            <View style={shiftStyles.buttonContainerOuter}>
                <View style={shiftStyles.buttonContainerInner}>

                    <Button
                        icon={() => (
                            <View style={Iconstyles.buttonPosition}>
                                <StackedIcons
                                    names={['camera', 'plus']}
                                    styles={[{ opacity: 0.6, position: 'absolute' }, { opacity: 0.9, position: 'absolute' }]}
                                />
                            </View>
                        )}
                        mode="contained"
                        buttonColor='#059636'
                        onPress={() => {
                            setMode(treeFormModes.addTree);
                            setModalVisible(true);
                            setSaplingID(null);
                        }}
                        contentStyle={Iconstyles.buttonContent}
                        labelStyle={Iconstyles.buttonLabel}
                    >
                        {Strings.buttonLabels.AddImage}

                    </Button>
                </View>

                <View style={shiftStyles.buttonRow}>
                    <View style={shiftStyles.buttonRowInner}>
                        <Button
                            icon={() => (
                                <MCIcon name="wifi-sync" size={30} color="white" />
                            )}
                            mode="contained"
                            buttonColor='#059636'
                            onPress={() => {
                                navigation.navigate(
                                    Strings.screenNames.getString('SyncDisplay', Strings.english)
                                )
                            }}
                            contentStyle={Iconstyles.buttonContent2}
                            labelStyle={Iconstyles.buttonLabel}
                        >
                            {Strings.buttonLabels.SyncData}

                        </Button>
                    </View>

                    <View style={{ width: '40%' }}>
                        <Button
                            icon={() => (
                                <MCIcon name="check" size={30} color="white" />
                            )}
                            mode="contained"
                            buttonColor='#059636'
                            onPress={saveShiftToDB}
                            contentStyle={Iconstyles.buttonContent2}
                            labelStyle={Iconstyles.buttonLabel}
                        >
                            {Strings.buttonLabels.Done}

                        </Button>
                    </View>
                </View>

            </View>
        );
    };

    const handleSaplingChanges = (saplingID) => {
        console.log("handleSaplingChanges", saplingID);
        setMode(treeFormModes.localEdit);
        setSaplingID(saplingID);
        setModalVisible(true);
    }

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
            <ScrollView keyboardShouldPersistTaps='handled' style={shiftStyles.scrollView}>

                <View style={shiftStyles.container}>
                    <ShiftHeader
                        onSetTime={(seconds) => {
                            finalRef.current.seconds = seconds;
                        }}
                        handleModalChanges={handleModalChanges}
                    />

                    {!modalVisible && <RenderHeader2 />}

                    {/* <CustomModal
                        modalVisible={modalVisible}
                        setModalVisible={setModalVisible}
                        mode={mode}
                        onFetchData={fetchSaplingsForShift}
                        saplingID={saplingID}
                        finalShiftData={finalRef}
                    /> */}

                   <AddImageModal
                   modalVisible={modalVisible}
                   setModalVisible={setModalVisible}
                   />
                </View>


                {
                    !modalVisible && <View style={shiftStyles.treeListContainer}>
                        <FlatList
                            style={shiftStyles.flatList}
                            scrollEnabled={false}
                            ListEmptyComponent={() => (
                                <View style={commonStyles.borderedDisplay}>
                                    <Text style={{ ...commonStyles.text5, color: lightTheme ? '#52525C' : 'black', }}>
                                        {Strings.messages.NoTreesWithAddedImage}
                                    </Text>
                                </View>
                            )}
                            data={finalList}

                            renderItem={({ item, index }) => {
                                if (index % 4 === 0) {
                                    const trees = [
                                        item,
                                        finalList[index + 1] || null,
                                        finalList[index + 2] || null,
                                        finalList[index + 3] || null,
                                    ];
                                    return (<TreeRow
                                        tree1={trees[0]}
                                        tree2={trees[1]}
                                        tree3={trees[2]}
                                        tree4={trees[3]}
                                        modalMode={true}
                                        handleSaplingChanges={handleSaplingChanges}
                                    />);
                                }
                                return null;
                            }}
                            keyExtractor={(item, index) => `${item.sapling_id}-${index}`}
                        />
                    </View>
                }

            </ScrollView>
        );
    }



}

export default AddImageShift;