import React from 'react';
import { View, Text, TouchableOpacity, ToastAndroid } from 'react-native';
import { Strings } from '../services/Strings';
import { commonStyles, TreeRowStyles } from '../services/Styles';
import { useNavigation } from '@react-navigation/native';

export const TreeRow = ({ tree1, tree2, tree3, tree4, shiftID, modalMode, handleSaplingChanges }) => {
    const navigation = useNavigation();

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
            console.log("modalmode---", modalMode);
            if (modalMode) {
                handleSaplingChanges(tree.sapling_id);
            } else {
                navigation.navigate(
                    Strings.screenNames.getString('EditLocalTree', Strings.english),
                    { sapling_id: tree.sapling_id, shiftID }
                );
            }
        };

        const onPress = () => {
            if (tree.uploaded) {
                ToastAndroid.show(Strings.alertMessages.Synched, ToastAndroid.SHORT);
                return;
            }
            handlePress();
        };

        return (
            <View style={{ ...treeStyle, ...TreeRowStyles.treeContainer }}>
                <TouchableOpacity onPress={onPress}>
                    <Text style={textStyle} numberOfLines={1} ellipsizeMode="tail">
                        {tree.sapling_id}
                    </Text>
                </TouchableOpacity>
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
