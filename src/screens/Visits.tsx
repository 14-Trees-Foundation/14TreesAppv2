import { View, BackHandler, ScrollView, StyleSheet, ToastAndroid } from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import GlobalContext from "../context/GlobalContext ";

import { DaoClient } from "../services/db/dao";
import VisitForm from "../components/visit/VisitForm";
import VisitCard from "../components/visit/VisitCard";
import VisitInfo from "../components/visit/VisitInfo";
import { TouchableOpacity } from "react-native";
import { CreateVisitRequest, Visit } from "../model/visits";
import { useFocusEffect } from "@react-navigation/native";
import { AddIconButton } from "../components/FABplusIcon";
import SearchBar from "../components/Searchbar";
import { Image } from "../model/common";
import InternetBanner from "../components/InternetInfo";
import { TreeForm } from "../components/trees/NewTreeForm";
import { CreateTreeRequest, Tree } from "../model/tree";
import { TreeImageType } from "../model/tree_image";

interface VisitsInputProps {
    navigation: any
}

const Visits: React.FC<VisitsInputProps> = ({ navigation }) => {

    const { langChanged, setPlaySound } = useContext(GlobalContext);
    useEffect(() => {
        console.log('langChanged inside Visits: ', langChanged);
    }, [langChanged]);
    const [stateChange, setStateChange] = useState(0);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [treeModal, setTreeModal] = useState(false);
    const [isInfoModalVisible, setInfoModalVisible] = useState(false);
    const [changeMode, setChangeModel] = useState<'add' | 'edit'>('add');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
    const [visits, setVisits] = useState<Visit[]>([]);

    let daoClient: DaoClient;
    DaoClient.authenticate().then((client) => { daoClient = client; });

    useFocusEffect(
        useCallback(() => {
            setIsFormVisible(false);
            setTreeModal(false);
            setStateChange(prev => prev + 1);
            return () => {
            };
        }, [])
    );

    useEffect(() => {
        const backAction = () => {
            navigation.goBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        if (searchQuery.length > 0) return;
        setTimeout(async () => {
            let visits = await daoClient.visits.getVisits(0, 100);
            setVisits(visits);
        }, 100)
    }, [searchQuery, stateChange])

    useEffect(() => {
        if (searchQuery.length < 1) return;
        setTimeout(async () => {
            let visits = await daoClient.visits.searchVisits(searchQuery, 0, 100);
            setVisits(visits);
        }, 100)
    }, [searchQuery, stateChange])

    const handleSave = (data: Visit | CreateVisitRequest, images?: Image[]) => {
        setIsFormVisible(false);
        setTimeout(async () => {

            if (changeMode === 'add') {
                let request = JSON.parse(JSON.stringify(data)) as CreateVisitRequest;
                await daoClient.visits.createVisit(request)
            } else {
                let request = JSON.parse(JSON.stringify(data)) as Visit;
                // await daoClient.visits.updateVisit(request)

                if (images && images.length > 0 && request.id) {
                    await daoClient.visitImages.insertVisitImages(request.id, images);
                    setPlaySound(true);
                    ToastAndroid.show("Added Visit images locally!", ToastAndroid.LONG)
                }
            };

            setStateChange(prev => prev + 1);
        }, 1000)
    };

    const handleDelete = () => {
        if (selectedVisit) {
            setTimeout(async () => {
                await daoClient.visits.deleteVisit(selectedVisit.local_id);
                setStateChange(prev => prev + 1);
            }, 1000)
        }
    }

    const handleTreeSave = (data: Tree | CreateTreeRequest, images?: any) => {
        let hasError = false;

        const saveTree = async () => {
            const localClient = await DaoClient.authenticate();
            data = JSON.parse(JSON.stringify(data)) as CreateTreeRequest;
            try {
                const success = await localClient.trees.createTree(data)
                if (success) {
                    setPlaySound(true);
                    ToastAndroid.show("Added Tree Locally!", ToastAndroid.SHORT);
                } else {
                    ToastAndroid.show("Tree with given sapling id already exists!", ToastAndroid.LONG)
                    hasError = true;
                }
            } catch (err: any) {
                hasError = true;
                console.log(err)
                ToastAndroid.show("Failed to add tree locally!", ToastAndroid.SHORT)
            }
    
            const upsertImage = async (type: TreeImageType) => {
                if (images[type]) {
                    try {
                        await localClient.treeImages.upsertTreeImage({
                            name: images[type].name,
                            data: images[type].data,
                            sapling_id: data.sapling_id,
                            type: type,
                            is_active: null,
                            user_id: null,
                        })
                    } catch (err: any) {
                        ToastAndroid.show(`Failed to add ${type.replace('_', ' ')} locally!`, ToastAndroid.SHORT)
                    }
                }
            }
    
            if (!hasError) {
                upsertImage('tree_image')
                upsertImage('user_card_image')
                upsertImage('user_tree_image')
                ToastAndroid.show("Updated Tree images locally!", ToastAndroid.SHORT)
            }
        }
        
        saveTree();

    };

    return (
        <View style={{ flex: 1 }}>
            <InternetBanner />
            <View style={styles.safeArea}>
                {!(isFormVisible || treeModal) && <View style={styles.header}>
                    <SearchBar query={searchQuery} onChange={setSearchQuery} />
                </View>}
                {!(isFormVisible || treeModal) && <ScrollView style={styles.scrollView} contentContainerStyle={{ alignItems: 'center' }}>
                    {visits.map((visit, index) => (
                        <View style={{ width: '95%' }} key={index}>
                            <TouchableOpacity style={{ width: '100%', alignItems: 'center' }} activeOpacity={0.9} key={index} onPress={() => {
                                setSelectedVisit(visit);
                                setInfoModalVisible(true);
                            }}>
                                <VisitCard
                                    visit={visit}
                                    onTreeAdd={() => {setSelectedVisit(visit); setTreeModal(true)}}
                                    onEdit={() => { setChangeModel('edit'); setIsFormVisible(true); }}
                                />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>}
                {/* {!(isFormVisible || treeModal) && <AddIconButton onClick={() => {
                setIsFormVisible(true);
                setSelectedVisit(null);
                setChangeModel('add');
            }} />} */}

                {(isFormVisible && !treeModal) && <VisitForm
                    changeMode={changeMode}
                    onCancel={() => setIsFormVisible(false)}
                    onSubmit={handleSave}
                    visit={selectedVisit}
                />}

                {(selectedVisit && !treeModal) && <VisitInfo
                    isVisible={isInfoModalVisible}
                    onClose={() => { setInfoModalVisible(false) }}
                    onEdit={() => { setChangeModel('edit'); setIsFormVisible(true); }}
                    onDelete={handleDelete}
                    visit={selectedVisit}
                />}

                {(!isFormVisible && treeModal) && <TreeForm 
                    tree={null}
                    changeMode="add"
                    onCancel={() => setTreeModal(false)}
                    onSubmit={handleTreeSave}
                    visit={selectedVisit ?? undefined}
                />}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        width: '100%',
        alignItems: 'center'
    },
    header: {
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 10,
        height: 50,
        width: '95%'
    },
    scrollView: {
        flex: 1,
        width: '100%'
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
});

export default Visits;