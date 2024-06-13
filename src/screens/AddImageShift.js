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
import PlotSelectModal from '../components/PlotSelectModal';

const AddImageShift = ({ route,navigation }) => {
    const { plotSelected, treesPlanted, setTreesPlanted, setShiftDone, shiftType,setPlotSelected, shiftTime, shiftID, setShiftID, lightTheme } = useContext(GlobalContext);

    const [finalList, setFinalList] = useState(null);
    

    const [modalVisible, setModalVisible] = useState(false);
    const [plotModalVisible, setPlotModalVisible] = useState(false);
    const [mode, setMode] = useState(null);
    const [saplingID, setSaplingID] = useState(null);

    const finalRef = useRef({ shift_id: null, shiftTime: null, seconds: null, treesPlanted: 0, plotselected: null });
    finalRef.current.shift_id = shiftID;
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
                        onPress: () => { 
                            console.log("----------------saving shift to DB--------------")
                            saveShiftToDB() }
                    }
                ]
            );


            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove(); // Remove event listener on cleanup


    }, []);


    const fetchSaplingsForShift = async () => {
        
        //if(!shiftID) return
        const { treesInLocalShifts, shiftType } = await Utils.fetchSaplingsFromLocalShiftDB(shiftID);

        treesInLocalShifts.sort((a, b) => {
            if (a.uploaded && !b.uploaded) {
                return 1; // Move uploaded trees to the end
            }
            if (!a.uploaded && b.uploaded) {
                return -1; // Keep non-uploaded trees before uploaded trees
            }
            return 0; // Maintain the original order
        });

        setFinalList(treesInLocalShifts);
        console.log('setting both lists to: ', treesInLocalShifts, treesInLocalShifts.length);
    };

    useFocusEffect( 
        useCallback(() => {
            console.log('-------------------focus---------------------',shiftID);
            if (shiftID) {
                fetchSaplingsForShift();
            }
        }, [shiftID])
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
            console.log("shift id to delete---", shiftID, finalRef.current.shift_id);
            await Utils.deleteShiftLocalDB(finalRef.current.shift_id);
        }

        navigation.navigate(
            Strings.screenNames.getString('Shifts', Strings.english)
        )
        setTreesPlanted(0);
        setPlotSelected(null);
        setShiftDone(true);
        console.log("--------------------setting shiftID null--image-------------")
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
                                    Strings.screenNames.getString('SyncDisplay', Strings.english),
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
        //setModalVisible(true);
        setPlotModalVisible(true);
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
                    

                    {!modalVisible && !plotModalVisible && <RenderHeader2 />}


                    <AddImageModal
                        modalVisible={modalVisible}
                        setModalVisible={setModalVisible}
                        finalShiftData={finalRef}
                        onFetchData={fetchSaplingsForShift}
                    />


                    <PlotSelectModal
                        plotModalVisible={plotModalVisible}
                        setPlotModalVisible={setPlotModalVisible}
                        mode={mode}
                        onFetchData={fetchSaplingsForShift}
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
                                        shiftTypeOfTrees={shiftType}
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