import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, ToastAndroid } from 'react-native';
import { Strings } from '../services/Strings';
import { commonStyles, TreeRowStyles } from '../services/Styles';
import { useNavigation } from '@react-navigation/native';
import { shiftTypes } from '../screens/Shifts';
import { Utils } from '../services/Utils';
import GlobalContext from '../context/GlobalContext ';

export const TreeRow = ({ tree1, tree2, tree3, tree4, shiftID, modalMode, shiftTypeOfTrees, handleSaplingChanges }) => {
    const navigation = useNavigation();

    console.log("----------shiftTypeOfTrees----------", shiftTypeOfTrees, shiftID)
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

        const handlePress = () => {

            if (modalMode) {
                handleSaplingChanges(tree.sapling_id);
            } else {
                
                navigation.navigate(
                    Strings.screenNames.getString('EditLocalTree', Strings.english),
                    { sapling_id: tree.sapling_id, shiftID }
                );

            }
        };

        const handleDeleteItem = async () => {
            // console.log("modalmode---", modalMode, tree.sapling_id);
            await Utils.deleteSaplingUpdatePlotDB(tree.sapling_id);
            await Utils.deleteSaplingInShiftDB(tree.sapling_id, shiftID);
            handleSaplingChanges();
            setTreesPlanted(treesPlanted - 1);
        }

        const handleDelete = async () => {

            if (tree.uploaded) {
                ToastAndroid.show(Strings.alertMessages.Synched, ToastAndroid.SHORT);
                return;
            }

            Utils.confirmAction(
                () => handleDeleteItem(tree.sapling_id),
                Strings.alertMessages.confirmDeleteSapling,
            )
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
                    (<TouchableOpacity disabled={true}>
                        <Text style={textStyle} numberOfLines={1} ellipsizeMode="tail">
                            {tree.sapling_id}
                        </Text>
                    </TouchableOpacity>)}

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
