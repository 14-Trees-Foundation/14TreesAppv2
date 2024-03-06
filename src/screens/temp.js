import React, { useContext, useEffect, useState } from 'react';
import { Button, FlatList, Image, Modal, ScrollView, Text, ToastAndroid, View, } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CustomButton, MyIconButton } from '../components/Components';
import { CustomDropdown } from '../components/CustomDropdown';
import { Strings } from '../services/Strings';
import { Utils } from '../services/Utils';
import { SyncDisplay } from '../components/SyncDisplay';
import { commonStyles } from '../services/Styles';
import LangContext from '../context/LangContext ';

const Temp = ({ navigation }) => {

    const [treeList, setTreeList] = useState(null);
    const [finalList, setFinalList] = useState(null);
    const [treeTypeList, setTreeTypeList] = useState([]);
    const [plotList, setPlotList] = useState([]);
    const [saplingIdList, setsaplingIdList] = useState([]);
    const [uploadStatusList, setUploadStatusList] = useState([]);
    const [allTreeTypes, setAllTreeTypes] = useState([]);
    const [allPlots, setAllPlots] = useState([]);

    const { shifts, setShifts } = useContext(LangContext);

    const uploadStatuses = [
        { name: Strings.messages.LocalOrSynced, value: 0 },
        { name: Strings.messages.Local, value: 1 },
        { name: Strings.messages.synced, value: 2 },
    ];

    const [selectedUploadStatus, setSelectedUploadStatus] = useState(
        uploadStatuses[0],
    );



    const fetchTreesFromLocalDB = () => {
        Utils.fetchTreesFromLocalDB().then(trees => {
            // console.log(trees)
            const syncedTrees = trees.filter(tree => tree.uploaded === true);
            const localTrees = trees.filter(tree => tree.uploaded !== true);
            trees = [...localTrees, ...syncedTrees];
            setTreeList(trees);
            setFinalList(trees);
            console.log('setting both lists to: ', trees);
        });
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchTreesFromLocalDB();
            console.log('focus');
        }, []),
    );

    useEffect(() => {
        setUploadStatusList(uploadStatuses);

        // Utils.getUserId().then(id => {
        //     setUserId(id);
        // });

        Utils.getLocalTreeTypesAndPlots().then(response => {
            setAllTreeTypes(response.treeTypes);
            setAllPlots(response.plots);
        });

        Utils.fetchTreeTypesFromLocalDB().then(types => {
            console.log('tree types', types);
            setTreeTypeList(types);
        });
        Utils.fetchPlotNamesFromLocalDB().then(plots => {
            setPlotList(plots);
        });
        Utils.fetchSaplingIdsFromLocalDB().then(ids => {
            console.log("----ids----", ids);
            setsaplingIdList(ids);
        });
        console.log('local data view');
    }, []);

    const renderImg = item => {
        // console.log(item.data.slice(0,30));
        return (
            <View style={{ margin: 0, flexDirection: 'row', flexWrap: 'wrap' }}>
                <Image
                    source={{ uri: `data:image/jpeg;base64,${item.data}` }}
                    style={{ width: 100, height: 100 }} // Set your desired image dimensions and margin
                />
            </View>
        );
    };

    const typeNameFromId = id => {
        return allTreeTypes.find(type => type.value === id).name;
    };

    const plotNameFromId = id => {
        return allPlots.find(type => type.value === id).name;
    };

    const renderTree = tree => {
        return (
            <View
                style={{
                    ...commonStyles.borderedDisplay,
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                }}>
                <View style={{ justifyContent: 'space-around', flexGrow: 1 }}>
                    <Text style={{ ...commonStyles.text }}>
                        {console.log("i am here")}
                        {Strings.messages.SaplingNo}: {tree.sapling_id}
                    </Text>

                    {/* Namrata */}
                    <View style={{ width: 250 }}>
                        <Text style={{ ...commonStyles.text }}>{Strings.messages.Plot}: {plotNameFromId(tree.plot_id)}</Text>
                    </View>
                    <Text style={{ ...commonStyles.text }}>
                        {Strings.messages.Type}: {typeNameFromId(tree.type_id)}
                    </Text>

                    {tree.uploaded ? (
                        <Text style={{ ...commonStyles.success, ...commonStyles.label }}>
                            {Strings.messages.Synced}
                        </Text>
                    ) : (
                        <View
                            style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                            <Text style={{ ...commonStyles.danger, ...commonStyles.label }}>
                                {Strings.messages.Local}
                            </Text>
                            <MyIconButton
                                name={'edit'}
                                text={Strings.buttonLabels.edit}
                                onPress={() => {
                                    navigation.navigate(
                                        Strings.screenNames.getString(
                                            'EditLocalTree',
                                            Strings.english,
                                        ),
                                        { sapling_id: tree.sapling_id },
                                    );
                                }}
                            />
                        </View>
                    )}
                </View>
                {tree.images.length ? (
                    <View style={{ padding: 10 }}>{renderImg(tree.images[0])}</View>
                ) : (
                    <Text
                        style={{
                            flex: 1,
                            flexWrap: 'wrap',
                            flexShrink: 1,
                            color: 'black',
                            fontSize: 20,
                            textAlign: 'center',
                            backgroundColor: 'white',
                            margin: 5,
                            textAlignVertical: 'center',
                        }}>
                        {Strings.messages.NoImageFound}{' '}
                    </Text>
                )}
            </View>
        );
    };


    //final return
    return (
        <View style={{ backgroundColor: '#5DB075', height: '100%' }}>
            {finalList === null ? (
                <Text style={commonStyles.text2}>{Strings.messages.LoadingTrees}</Text>
            ) : (
                <FlatList
                    style={{ backgroundColor: 'white' }}
                    ListEmptyComponent={() => (
                        <View style={{ ...commonStyles.borderedDisplay }}>
                            <Text style={{ ...commonStyles.text5 }}>
                                {Strings.messages.NoTreesFound}
                            </Text>
                        </View>
                    )}

                    ListHeaderComponent={
                        treeList &&
                        treeList.length > 0 && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
                                <MyIconButton
                                    name={'delete'}
                                    size={25}
                                    text={"Sync"}
                                    onPress={() => Utils.confirmAction(deleteSyncedTrees)}
                                    color="green"
                                />
                                <MyIconButton
                                    name={'check'}
                                    size={25}
                                    text={"Done"}
                                    onPress={() => {
                                        navigation.goBack()
                                        setShifts(shifts + 1);
                                    }}
                                    color="green"
                                />

                                {/* <Text style={{ backgroundColor: "green",color: 'white', marginLeft: 20, marginHorizontal: 8, marginTop: 8, fontSize: 18, fontWeight: 'bold', }}>All Trees Planted</Text> */}
                                {/* <SyncDisplay onSyncComplete={() => fetchTreesFromLocalDB()} /> */}
                                {/* <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-around',
                                    }}>
                                    <MyIconButton
                                        name={'filter'}
                                        size={25}
                                        text={Strings.buttonLabels.Filters}
                                        onPress={openModal}
                                    />
                                    <MyIconButton
                                        name={'delete'}
                                        size={25}
                                        text={Strings.buttonLabels.DeleteSyncedTrees}
                                        onPress={() => Utils.confirmAction(deleteSyncedTrees)}
                                        color="red"
                                    />
                                </View> */}
                                {/* {finalList !== treeList && (
                                    <View style={{ margin: 20, marginBottom: 5 }}>
                                        <Button
                                            title={Strings.buttonLabels.ClearFilters}
                                            onPress={clearFilters}
                                            color={'black'}
                                        />
                                    </View>
                                )} */}
                            </View>
                        )
                    }
                    data={finalList}
                    renderItem={({ item }) => renderTree(item)}></FlatList>
            )}
        </View>
    )

}

export default Temp;