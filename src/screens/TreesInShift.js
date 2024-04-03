import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useContext, useState } from "react";
import { Text, View, BackHandler, ScrollView, FlatList, TouchableOpacity, ToastAndroid } from "react-native";
import { Utils } from "../services/Utils";
import { Strings } from "../services/Strings";
import { commonStyles } from "../services/Styles";
import Icon from 'react-native-vector-icons/FontAwesome5';
import GlobalContext from "../context/GlobalContext ";

const TreesInShift = ({ navigation, route }) => {
    const { shiftID, plotselected, starttime, endtime, timetaken, treesplanted, timestamp } = route.params;
    const { lightTheme } = useContext(GlobalContext);
    console.log("shiftID TreesInShift---", shiftID, plotselected, starttime, endtime, timetaken, treesplanted);

    const [finalList, setFinalList] = useState(null);

    useEffect(() => {

        console.log("inside local tree edit");
        const backAction = () => {
            navigation.goBack()
            return true; // Prevent default behavior (exit app)
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, []);

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
            console.log('setting both lists to: ', finalListForShift);
        });
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchTreesFromLocalDB();
            console.log('focus');
        }, []),
    );

    const renderTree = (tree1, tree2, tree3, tree4) => {
        console.log("upload:--", tree1.uploaded);
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
                ) : (
                    <View style={{ ...commonStyles.borderedDisplay, flex: 1, justifyContent: 'space-around', width: '25%' }}>
                        <TouchableOpacity onPress={() => {
                            navigation.navigate(
                                Strings.screenNames.getString(
                                    'EditLocalTree',
                                    Strings.english,
                                ),
                                { sapling_id: tree1.sapling_id },
                            );
                        }}>
                            <Text style={{ ...commonStyles.text, color: 'black', textAlign: 'center' }}>
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
                ) :
                    (<View style={{ ...commonStyles.borderedDisplay, flex: 1, justifyContent: 'space-around', width: '25%' }}>
                        <TouchableOpacity onPress={() => {
                            navigation.navigate(
                                Strings.screenNames.getString(
                                    'EditLocalTree',
                                    Strings.english,
                                ),
                                { sapling_id: tree2.sapling_id },
                            );
                        }}>
                            <Text style={{ ...commonStyles.text, color: 'black', textAlign: 'center' }}>
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
                        navigation.navigate(
                            Strings.screenNames.getString(
                                'EditLocalTree',
                                Strings.english,
                            ),
                            { sapling_id: tree3.sapling_id },
                        );
                    }}>
                        <Text style={{ ...commonStyles.text, color: 'black', textAlign: 'center' }}>
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
                ) :
                    (<View style={{ ...commonStyles.borderedDisplay, flex: 1, justifyContent: 'space-around', width: '25%' }}>
                        <TouchableOpacity onPress={() => {
                            navigation.navigate(
                                Strings.screenNames.getString(
                                    'EditLocalTree',
                                    Strings.english,
                                ),
                                { sapling_id: tree4.sapling_id },
                            );
                        }}>
                            <Text style={{ ...commonStyles.text, color: 'black', textAlign: 'center' }}>
                                {tree4.sapling_id}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    ) : <View style={{ justifyContent: 'space-around', width: '25%' }}></View>
                }
            </View>
        );
    };

    return (
        <ScrollView keyboardShouldPersistTaps='handled' style={{ backgroundColor: 'white', height: '100%' }}>

            <View style={{ ...commonStyles.borderedDisplay, flex: 1, flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'white', opacity: 0.8, borderRadius: 6 }}>
                <View style={{ flex: 1, flexDirection: 'column' }}>
                    <Text style={{ ...commonStyles.text, color: lightTheme ? '#52525C' : 'black', fontSize: 18, textAlign: 'center' }}>
                        {plotselected}
                    </Text>

                    <View style={{ flex: 1, flexDirection: 'row', marginTop: 12 }}>
                        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-around', width: '70%', marginLeft: 12 }}>

                            <Text style={{ ...commonStyles.text, color: lightTheme ? '#52525C' : 'black', fontSize: 12 }}>
                                {Strings.labels.Date} :{timestamp}
                            </Text>
                            <Text style={{ ...commonStyles.text, color: lightTheme ? '#52525C' : 'black', fontSize: 12 }}>
                                {Strings.labels.StartTime} :{starttime}
                            </Text>
                            <Text style={{ ...commonStyles.text, color: lightTheme ? '#52525C' : 'black', fontSize: 12 }}>
                                {Strings.labels.EndTime} :{endtime}
                            </Text>
                            <Text style={{ ...commonStyles.text, color: lightTheme ? '#52525C' : 'black', fontSize: 12 }}>
                                {Strings.labels.TimeTaken} :{timetaken}
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
                                <Text style={{ color: lightTheme ? '#52525C' : 'black', fontSize: 18, fontWeight: 'bold', padding: 10, textAlign: 'center' }}>
                                    {treesplanted}
                                </Text>
                            </View>


                        </View>
                    </View>
                </View>

            </View>

            <View style={{ margin: 2, borderColor: '#5DB075', borderRadius: 5, flexDirection: 'row', backgroundColor: 'white' }}>
                {finalList === null ? (
                    <Text style={commonStyles.text2}>{Strings.messages.LoadingTrees}</Text>
                ) : (<FlatList
                    style={{ flex: 1, backgroundColor: 'white' }}
                    scrollEnabled={false}
                    ListEmptyComponent={() => (
                        <View style={{ ...commonStyles.borderedDisplay, marginTop: 40 }}>
                            <Text style={{ ...commonStyles.text5, padding: 15 }}>
                                {Strings.messages.NoShiftTree}
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
                )}
            </View>

        </ScrollView>
    )
}

export default TreesInShift;