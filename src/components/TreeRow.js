import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, ToastAndroid, Alert } from 'react-native';
import { Strings } from '../services/Strings';
import { commonStyles, TreeRowStyles } from '../services/Styles';
import { useNavigation } from '@react-navigation/native';
import { shiftTypes } from '../screens/Shifts';
import { Utils } from '../services/Utils';
import GlobalContext from '../context/GlobalContext ';

export const TreeRow = ({ tree1, tree2, tree3, tree4, shiftID, modalMode, shiftTypeOfTrees, handleSaplingChanges, plotSelected }) => {
    const navigation = useNavigation();

    console.log("----------shiftTypeOfTrees----------", shiftTypeOfTrees, shiftID, modalMode)
    const { treesPlanted, setTreesPlanted } = useContext(GlobalContext);

    const renderTree = (tree) => {
        if (!tree) {
            return <View style={TreeRowStyles.emptyTreeContainer}></View>;
        }

        const treeStyle = tree.uploaded
            ? { ...commonStyles.borderedDisplay2, ...TreeRowStyles.uploadedTreeStyle }
            : commonStyles.borderedDisplay;

        const textStyle = tree.uploaded
            ? { ...commonStyles.text, ...TreeRowStyles.uploadedTextStyle }
            : { ...commonStyles.text, ...TreeRowStyles.textStyle, color: 'black' };

        const handleDeleteItemAddImage = async (saplingID) => {
            console.log("sapling id---", saplingID);
            await Utils.deleteAddTreeImagesBySaplingId(saplingID);
            await Utils.deleteSaplingInShiftDB(saplingID, shiftID);
            handleSaplingChanges();
            setTreesPlanted(treesPlanted - 1);
        }

        const handlePress = async () => {

            if (modalMode) {
                handleSaplingChanges(tree.sapling_id);
            } else {

                if (shiftTypeOfTrees === shiftTypes.addSapling) {
                    navigation.navigate(
                        Strings.screenNames.getString('EditLocalTree', Strings.english),
                        { sapling_id: tree.sapling_id, shiftID }
                    );

                } else if (shiftTypeOfTrees === shiftTypes.addImage) {
                    //add feature/check to delete dead sapling
                    const treeDetails = await Utils.fetchLocalTreeImage(tree.sapling_id);

                    if (!treeDetails || treeDetails?.inActive === 1) {

                        Alert.alert(Strings.alertMessages.MarkedSaplingDead, Strings.alertMessages.ConfirmDeleteEntry, [
                            {
                                text: Strings.alertMessages.Yes,
                                onPress: () => handleDeleteItemAddImage(tree.sapling_id)
                            },
                            {
                                text: Strings.alertMessages.No,
                                onPress: () => null
                            }
                        ])
                        return;
                    }

                    navigation.navigate(
                        Strings.screenNames.getString('EditLocalAddImage', Strings.english),
                        {
                            sapling_id: tree.sapling_id, shiftID,
                            plotSelected: plotSelected
                        }
                    );
                }
            }
        };

        const handleDeleteItem = async (saplingid) => {
            await Utils.deleteSaplingUpdatePlotDB(saplingid);
            await Utils.deleteSaplingInShiftDB(saplingid, shiftID);
            handleSaplingChanges();
            setTreesPlanted(treesPlanted - 1);
        }

        const handleDelete = async () => {

            if (tree.uploaded) {
                ToastAndroid.show(Strings.alertMessages.Synched, ToastAndroid.SHORT);
                return;
            }

            Alert.alert("", Strings.alertMessages.ConfirmDeleteEntry, [
                {
                    text: Strings.alertMessages.Yes,
                    onPress: () => handleDeleteItem(tree.sapling_id)
                },
                {
                    text: Strings.alertMessages.No,
                    onPress: () => null
                }
            ])
        }

        const onPress = () => {
            if (tree.uploaded) {
                ToastAndroid.show(Strings.alertMessages.Synched, ToastAndroid.SHORT);
                return;
            }
            handlePress();
        };

        return (
            <View style={{ ...treeStyle, ...TreeRowStyles.treeContainer }}>
                {shiftTypeOfTrees === shiftTypes.addSapling &&
                    (<TouchableOpacity onPress={onPress}>
                        <Text style={textStyle} numberOfLines={1} ellipsizeMode="tail">
                            {tree.sapling_id}
                        </Text>
                    </TouchableOpacity>)
                }

                {shiftTypeOfTrees === shiftTypes.addImage &&
                    (<TouchableOpacity onPress={onPress}>
                        <Text style={textStyle} numberOfLines={1} ellipsizeMode="tail">
                            {tree.sapling_id}
                        </Text>
                    </TouchableOpacity>)
                }

                {
                    shiftTypeOfTrees === shiftTypes.updatePlot &&
                    (<TouchableOpacity onPress={handleDelete}>
                        <Text style={textStyle} numberOfLines={1} ellipsizeMode="tail">
                            {tree.sapling_id}
                        </Text>
                    </TouchableOpacity>)
                }
            </View>
        );
    };

    return (
        <View style={TreeRowStyles.container}>
            {renderTree(tree1)}
            {renderTree(tree2)}
            {renderTree(tree3)}
            {renderTree(tree4)}
        </View>
    );
};
