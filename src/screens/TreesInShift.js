import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useContext, useState } from "react";
import { Text, View, BackHandler, ScrollView, FlatList, TouchableOpacity, ToastAndroid, StyleSheet } from "react-native";
import { Utils } from "../services/Utils";
import { Strings } from "../services/Strings";
import { commonStyles, treesInShiftStyles } from "../services/Styles";
import ShiftsCard from "../components/ShiftsCard";
import { TreeRow } from "../components/TreeRow";

const TreesInShift = ({ navigation, route }) => {
    const { shiftIDs, itemData } = route.params;
    console.log("shiftID TreesInShift---", shiftIDs);

    const [finalList, setFinalList] = useState(null);
    const [shiftTypeOfTrees, setShiftTypeOfTrees] = useState(null)

    useEffect(() => {

        console.log("inside local tree edit");
        const backAction = () => {
            navigation.goBack()
            return true; // Prevent default behavior (exit app)
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, []);

    const fetchTreesFromLocalDB = async () => {
        if (shiftIDs.localShiftId) {
            let { treesInLocalShifts, shiftType } = await Utils.fetchSaplingsFromLocalShiftDB(shiftIDs.localShiftId);
            console.log("----------shiftType-------", shiftType, treesInLocalShifts)
            treesInLocalShifts.sort((a, b) => {
                if (a.uploaded && !b.uploaded) {
                    return 1; // Move uploaded trees to the end
                }
                if (!a.uploaded && b.uploaded) {
                    return -1; // Keep non-uploaded trees before uploaded trees
                }
                return 0; // Maintain the original order
            });

            //setFinalList(modifiedTrees);
            console.log("--------treesInLocalShifts---", treesInLocalShifts);
            setShiftTypeOfTrees(shiftType);
            return treesInLocalShifts;
        }
        return [];
    };

    const fetchTreesFromLiveShifts = async () => { //shiftId -> UUID
        if (shiftIDs.liveShiftId) {
            let { treesInLiveShifts, shiftType } = await Utils.fetchSaplingsFromLiveShiftDB(shiftIDs.liveShiftId);
            //console.log("----------shiftType-------", shiftType, treesInLiveShifts)
            setShiftTypeOfTrees(shiftType);
            return treesInLiveShifts;
        }
        return [];
    };

    const getCombinedList = async (treesInLiveShifts, treesInLocalShifts) => {

        let combinedList = [];
        combinedList = [
            ...treesInLocalShifts,
            ...treesInLiveShifts
        ];

        const uniqueList = Array.from(new Set(combinedList.map(item => item.sapling_id))).map(id => {
                return combinedList.find(item => item.sapling_id === id);
        });

        setFinalList(uniqueList);

    }

    const fetchData = async () => {
        const treesInLiveShifts = await fetchTreesFromLiveShifts();
        const treesInLocalShifts = await fetchTreesFromLocalDB();
        await getCombinedList(treesInLiveShifts, treesInLocalShifts)
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
            console.log('focus');
        }, []),
    );


    return (
        <ScrollView keyboardShouldPersistTaps='handled' style={{ backgroundColor: 'white', height: '100%' }}>

            <ShiftsCard item={itemData} disableHandlePress={true} />

            <View style={treesInShiftStyles.treeListContainer}>
                {finalList === null ? (
                    <Text style={commonStyles.text2}>{Strings.messages.LoadingTrees}</Text>
                ) : (<FlatList
                    style={treesInShiftStyles.flatList}
                    scrollEnabled={false}
                    ListEmptyComponent={() => (
                        <View style={[commonStyles.borderedDisplay, treesInShiftStyles.emptyList]}>
                            <Text style={treesInShiftStyles.emptyListText}>
                                {Strings.messages.NoShiftTree}
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
                                shiftID={shiftIDs.localShiftId}
                                modalMode={false}
                                shiftTypeOfTrees={shiftTypeOfTrees}
                            />);
                        }
                        return null;
                    }}
                    keyExtractor={(item, index) => `${item.sapling_id}-${index}`}
                />
                )}
            </View>
        </ScrollView>
    )
}

export default TreesInShift;


