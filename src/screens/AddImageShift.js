import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { FlatList, Text, View, Alert, ScrollView, BackHandler, ToastAndroid } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackedIcons } from '../components/Components';
import { Strings } from '../services/Strings';
import { Utils, addTreeImageModes } from '../services/Utils';
import { CustomButtonStyles, Iconstyles, commonStyles, shiftStyles } from '../services/Styles';
import GlobalContext from '../context/GlobalContext ';
import ShiftHeader from '../components/ShiftHeader';
import { treeFormModes } from '../components/TreeForm';
import LoadingScreen from './LoadingScreen';
import { Button } from 'react-native-paper';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TreeRow } from '../components/TreeRow';
import PlotSelectModal from '../components/PlotSelectModal';
import AddImageModal from '../components/AddImageModal';
import EditImageModal from '../components/EditImageModal';

const AddImageShift = ({ route, navigation }) => {
    const { plotSelected, treesPlanted, setTreesPlanted, setShiftDone, shiftType, setPlotSelected, shiftTime, shiftID, setShiftID, lightTheme } = useContext(GlobalContext);

    const [finalList, setFinalList] = useState(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [plotModalVisible, setPlotModalVisible] = useState(false);
    const [mode, setMode] = useState(null);
    const [editSaplingID, setEditSaplingID] = useState(null);

    const finalRef = useRef({ shift_id: null, shiftTime: null, seconds: null, treesPlanted: 0, plotselected: null });
    finalRef.current.shift_id = shiftID;
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


    const fetchSaplingsForShift = async () => {
        console.log("shiftid--", shiftID);
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
                plot_selected: finalRef.current.plotselected,
                start_time: finalRef.current.shiftTime,
                end_time: endtime,
                shift_ended: 1, //made it 1
                shift_upload_complete: uploadedShift ? 1 : 0,
                time_taken: timetaken,
                trees_planted: finalRef.current.treesPlanted,
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
                <View style={{ ...shiftStyles.buttonContainerInner, marginHorizontal: 55, }}>

                    <Button
                        icon={() => (
                            <MCIcon name="plus" size={25} color="white" />
                        )}

                        //mode="contained"
                        buttonColor='#059636'
                        onPress={() => {
                            setMode(addTreeImageModes.addImage);
                            setModalVisible(true);
                        }}
                        labelStyle={CustomButtonStyles.buttonLabel}
                        style={CustomButtonStyles.button}
                    >
                        {Strings.buttonLabels.AddImage}

                    </Button>
                </View>

                <View style={shiftStyles.buttonRow}>
                    <View style={{ ...shiftStyles.buttonRowInner, marginRight: 5 }}>
                        <Button
                            icon={() => (
                                <MCIcon name="wifi-sync" size={22} color="white" />
                            )}
                            mode="contained"
                            buttonColor='#059636'
                            onPress={() => {
                                navigation.navigate(
                                    Strings.screenNames.getString('SyncDisplay', Strings.english),
                                )

                            }}
                            labelStyle={CustomButtonStyles.buttonLabel}
                            style={CustomButtonStyles.button}
                        >
                            {Strings.buttonLabels.SyncData}

                        </Button>
                    </View>

                    <View style={{ width: '50%', marginLeft: 5 }}>
                        <Button
                            mode="contained"
                            buttonColor='#059636'
                            onPress={saveShiftToDB}
                            labelStyle={CustomButtonStyles.buttonLabel}
                            style={CustomButtonStyles.button}
                        >
                            {Strings.buttonLabels.Done}

                        </Button>
                    </View>
                </View>

            </View>
        );
    };

    const handleDeleteItem = async (saplingID) => {
        //verify
        await Utils.deleteAddTreeImagesBySaplingId(saplingID);
        await Utils.deleteSaplingInShiftDB(saplingID, shiftID);
        fetchSaplingsForShift();
        setTreesPlanted(treesPlanted - 1);
    }

    const handleSaplingChanges = async (saplingID) => {
        console.log("handleSaplingChanges", saplingID);
        const treeDetails = await Utils.fetchLocalTreeImage(saplingID);

        if (!treeDetails || treeDetails?.inActive === 1) {

            Alert.alert(Strings.alertMessages.MarkedSaplingDead, Strings.alertMessages.ConfirmDeleteEntry, [
                {
                    text: Strings.alertMessages.Yes,
                    onPress: () => handleDeleteItem(saplingID)
                },
                {
                    text: Strings.alertMessages.No,
                    onPress: () => null
                }
            ])


            setModalVisible(false);
            return;
        }

        setMode(addTreeImageModes.editImage);
        setEditSaplingID(saplingID)
        setModalVisible(true);
    }

    const handleModalChanges = () => {
        setMode(treeFormModes.plotSelect);
        setPlotModalVisible(true);
    }

    if (finalList === null) {
        return (
            <LoadingScreen />
        )
    } else {
        return (
            <ScrollView keyboardShouldPersistTaps='handled' style={shiftStyles.scrollView}>

                <View style={{...shiftStyles.container, marginTop: 20}}>
                    <ShiftHeader
                        onSetTime={(seconds) => {
                            finalRef.current.seconds = seconds;
                        }}
                        handleModalChanges={handleModalChanges}
                    />


                    {!modalVisible && !plotModalVisible && <RenderHeader2 />}




                    {mode === addTreeImageModes.addImage && <AddImageModal
                        modalVisible={modalVisible}
                        setModalVisible={setModalVisible}
                        finalShiftData={finalRef}
                        onFetchData={fetchSaplingsForShift}
                    />}

                    {mode === addTreeImageModes.editImage && <EditImageModal
                        modalVisible={modalVisible}
                        setModalVisible={setModalVisible}
                        saplingID={editSaplingID}
                        onFetchData={fetchSaplingsForShift}
                    />}

                    <PlotSelectModal
                        plotModalVisible={plotModalVisible}
                        setPlotModalVisible={setPlotModalVisible}
                        mode={mode}
                        onFetchData={fetchSaplingsForShift}
                    />
                </View>


                {
                    !modalVisible &&
                    <View style={{ ...shiftStyles.buttonContainerOuter, marginBottom: 12 }}>
                        <View style={{ ...shiftStyles.buttonContainerInner, marginTop: 0, marginBottom: 2 }}>
                            <View style={shiftStyles.treeListContainer}>
                                <FlatList
                                    style={shiftStyles.flatList}
                                    scrollEnabled={false}
                                    ListEmptyComponent={() => (
                                        <View
                                        //style={commonStyles.borderedDisplay}
                                        >
                                            <Text style={{ ...commonStyles.text5, color: lightTheme ? '#333' : 'black', }}>
                                                {Strings.messages.NoTreesWithAddedImage}
                                            </Text>
                                        </View>
                                    )}
                                    data={finalList}

                                    renderItem={({ item, index }) => {
                                        //if (index % 4 === 0) {
                                        const trees = [
                                            item,
                                            // finalList[index + 1] || null,
                                            // finalList[index + 2] || null,
                                            // finalList[index + 3] || null,
                                        ];
                                        return (<TreeRow
                                            tree={trees[0]}
                                            // tree2={trees[1]}
                                            // tree3={trees[2]}
                                            // tree4={trees[3]}
                                            modalMode={true}
                                            handleSaplingChanges={handleSaplingChanges}
                                            shiftTypeOfTrees={shiftType}
                                        />);
                                        // }
                                        // return null;
                                    }}
                                    keyExtractor={(item, index) => `${item.sapling_id}-${index}`}
                                />
                            </View>
                        </View>
                    </View>
                }

            </ScrollView>
        );
    }



}

export default AddImageShift;