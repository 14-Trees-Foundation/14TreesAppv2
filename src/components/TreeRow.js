import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, ToastAndroid, Alert, Image } from 'react-native';
import { Strings } from '../services/Strings';
import { commonStyles, TreeRowStyles } from '../services/Styles';
import { useNavigation } from '@react-navigation/native';
import { shiftTypes } from '../screens/Shifts';
import { Utils } from '../services/Utils';
import GlobalContext from '../context/GlobalContext ';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export const TreeRow = ({ tree, shiftID, modalMode, shiftTypeOfTrees, handleSaplingChanges, plotSelected }) => {
    const navigation = useNavigation();

    console.log("----------shiftTypeOfTrees----------", tree)

    const { treesPlanted, setTreesPlanted, lightTheme } = useContext(GlobalContext);

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

        if (shiftTypeOfTrees === shiftTypes.updatePlot) {
            handleDelete();
            return;
        }

        handlePress();
    };

    const renderTree = (tree) => {
        if (!tree) {
            return <View style={TreeRowStyles.emptyTreeContainer}></View>;
        }

        const treeStyle = tree.uploaded
            ? {
                borderRadius: 15,
                margin: 5,
                padding: 3, ...TreeRowStyles.uploadedTreeStyle
            }
            : {
                borderRadius: 15,
                margin: 5,
                padding: 3,
            };

        const textStyle = tree.uploaded
            ? {
                fontSize: 18,
                fontFamily: 'Inter-Regular',
                color: 'black',
                textAlign: 'left',
                fontWeight: 'bold', color: 'green',
                fontWeight: 'bold',
                textAlign: 'center'
            }
            : {
                fontSize: 18,
                fontFamily: 'Inter-Regular',
                color: 'black',
                textAlign: 'left',
                fontWeight: 'bold', textAlign: 'center', color: 'black'
            };



        return (

            <View style={{
                ...treeStyle, borderRadius: 0,
                backgroundColor: "white", marginLeft: 10
                //marginLeft:80
            }}>
                {shiftTypeOfTrees === shiftTypes.addSapling &&
                    // (<TouchableOpacity style={{ width: '100%', alignItems: "flex-start", }} onPress={onPress}>
                    <Text style={textStyle} numberOfLines={1} ellipsizeMode="tail">
                        {tree.sapling_id}
                    </Text>
                    // </TouchableOpacity>)
                }

                {shiftTypeOfTrees === shiftTypes.addImage &&
                    // (<TouchableOpacity style={{ width: '100%', alignItems: "flex-start", }} onPress={onPress}>
                    <Text style={textStyle} numberOfLines={1} ellipsizeMode="tail">
                        {tree.sapling_id}
                    </Text>
                    // </TouchableOpacity>)
                }

                {
                    shiftTypeOfTrees === shiftTypes.updatePlot &&
                    // ( <TouchableOpacity style={{ width: '100%', alignItems: "flex-start", }} onPress={handleDelete}>
                    <Text style={textStyle} numberOfLines={1} ellipsizeMode="tail">
                        {tree.sapling_id}
                    </Text>
                    // </TouchableOpacity>)
                }
            </View>
        );
    };

    return (
        <View style={{
            flexDirection: 'row',
            //justifyContent: 'space-around',
            //width: '100%',
            borderWidth: 1,
            borderColor: "#5CC17B",
            backgroundColor: 'white',
            margin: 8,
            paddingHorizontal: 7,
            paddingVertical: 4,
            borderRadius: 6,
        }}>

            <Image
                source={require('../../assets/tree.png')}
                style={{
                    height: 35, width: 35
                }}
            />
            {renderTree(tree)}

            {!tree.uploaded &&
                <TouchableOpacity style={{ flex: 1, marginTop: 2, marginLeft: 0, alignItems: 'flex-end' }} onPress={onPress}>

                    <Image
                        source={shiftTypeOfTrees === shiftTypes.updatePlot ? require('../../assets/icon-delete.png') : require('../../assets/icon-pencil.png')}
                        style={{
                            height: 27, width: 27
                        }}
                    />
                </TouchableOpacity>
            }

            {tree.uploaded &&
                <TouchableOpacity style={{ flex: 1, marginTop: 2, marginLeft: 0, alignItems: 'flex-end' }} onPress={onPress}>
                    <MCIcon name="wifi-sync" size={27} color="green" />
                </TouchableOpacity>
            }


            {/* {renderTree(tree2)}
            {renderTree(tree3)}
            {renderTree(tree4)} */}
        </View>
    );
};
