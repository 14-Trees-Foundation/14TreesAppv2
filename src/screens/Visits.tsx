import { View, BackHandler, StyleSheet, ToastAndroid } from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import GlobalContext from "../context/GlobalContext ";

import { DaoClient } from "../services/db/dao";
import VisitForm from "../components/visit/VisitForm";
import VisitCard from "../components/visit/VisitCard";
import VisitInfo from "../components/visit/VisitInfo";
import VisitorDataForm from "../components/visit/VisitorDataForm";
import { TouchableOpacity } from "react-native";
import { CreateVisitRequest, Visit } from "../model/visits";
import { useFocusEffect } from "@react-navigation/native";
import { AddIconButton } from "../components/FABplusIcon";
import SearchBar from "../components/Searchbar";
import { Image } from "../model/common";
import InternetBanner from "../components/InternetInfo";
import { CreateTreeRequest, Tree } from "../model/tree";
import { TreeImageType } from "../model/tree_image";
import CardList from "../components/CardList";
import { Modal } from "react-native";
import SaplingRangeModal from "../components/plots/SaplingRangeModal";
import { Strings } from "../services/Strings";

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
    const [visitsPage, setVisitsPage] = useState(0);
    const [hasMoreVisits, setHasMoreVisits] = useState(true);
    const [rangeModalVisible, setRangeModalVisible] = useState(false);

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

        const getVisits = async () => {
            const daoClient = await DaoClient.authenticate();
            let resp = await daoClient.visits.getVisits(visitsPage * 10, 10);
            console.log('Visits page', visitsPage, 'resp.length', resp.length, 'local_ids', resp.map(v => v.local_id));

            setVisits(prev => {
                const merged = visitsPage === 0 ? resp : [...prev, ...resp];
                const unique = merged.filter((visit, index, self) =>
                    index === self.findIndex((t) => t.local_id === visit.local_id)
                );
                // console.log("uniqueVisits: ", JSON.stringify(unique, null, 3));
                return unique;
            });
            setHasMoreVisits(resp.length === 10);
        }

        getVisits();
    }, [visitsPage, searchQuery, stateChange])

    useEffect(() => {
        if (searchQuery.length < 1) return;

        const getVisits = async () => {
            const daoClient = await DaoClient.authenticate();
            let resp = await daoClient.visits.searchVisits(searchQuery, visitsPage * 10, 10);

            setVisits(prev => {
                const merged = visitsPage === 0 ? resp : [...prev, ...resp];
                const unique = merged.filter((visit, index, self) =>
                    index === self.findIndex((t) => t.local_id === visit.local_id)
                );
                return unique;
            });
            setHasMoreVisits(resp.length === 10);
        }

        getVisits();
    }, [visitsPage, searchQuery, stateChange])

    const handleSave = (data: Visit | CreateVisitRequest, images?: Image[]) => {
        setIsFormVisible(false);

        const saveVisit = async () => {
            const daoClient = await DaoClient.authenticate();
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
        }

        saveVisit();
    };

    const handleDelete = () => {

        const deleteVisit = async () => {
            if (selectedVisit) {
                const daoClient = await DaoClient.authenticate();
                await daoClient.visits.deleteVisit(selectedVisit.local_id);
                setStateChange(prev => prev + 1);
            }
        }

        deleteVisit();
    }

    // Visitor data save: capture images only, do NOT create a tree here
    const handleVisitorSubmit = async (payload: { sapling_id: string, user: any | null, visit_id: number | null, images: any }) => {
        const localClient = await DaoClient.authenticate();
        const { sapling_id, user, visit_id, images } = payload;

        try {
            const upsert = async (key: 'user_tree_image' | 'user_card_image') => {
                const img = images[key];
                if (!img) return;
                try {
                    await localClient.treeImages.upsertTreeImage({
                        name: img.name,
                        data: img.data,
                        sapling_id,
                        type: key,
                        is_active: null,
                        user_id: user ? (user.local_id ?? null) : null,
                        visit_id,
                    });
                } catch (err) {
                    ToastAndroid.show(`Failed to add ${key.replace('_', ' ')} locally!`, ToastAndroid.SHORT);
                }
            };

            await upsert('user_tree_image');
            await upsert('user_card_image');

            setPlaySound(true);
            console.log("Saved visitor data for sapling id: ", sapling_id, " image count: ", images?.length ?? 0);
            ToastAndroid.show("Saved visitor data locally!", ToastAndroid.SHORT);
            setTreeModal(false);
            // Trigger refresh of visit cards to update visitor data counts
            setStateChange(prev => prev + 1);
        } catch (error) {
            console.error('Error saving visitor data:', error);
            ToastAndroid.show("Failed to save visitor data!", ToastAndroid.SHORT);
        }
    };

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
                            visit_id: data.visit_id,
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

    const renderVisitItem = (visit: Visit, index: number) => {
        return (
            <View style={{ width: '100%', paddingHorizontal: 10 }} key={index}>
                <TouchableOpacity style={{ width: '100%', alignItems: 'center' }} activeOpacity={0.9} key={index} onPress={() => {
                    setSelectedVisit(visit);
                    setInfoModalVisible(true);
                }}>
                    <VisitCard
                        key={`${visit.local_id}-${stateChange}`}
                        visit={visit}
                        onTreeAdd={() => { setSelectedVisit(visit); setTreeModal(true) }}
                        onEdit={() => { setChangeModel('edit'); setIsFormVisible(true); }}
                        onRangeAdd={() => { setSelectedVisit(visit); setRangeModalVisible(true); }}
                    />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <InternetBanner />
            <View style={styles.safeArea}>
                {!(isFormVisible || treeModal) && <View style={styles.header}>
                    <SearchBar query={searchQuery} onChange={(text: string) => { setVisitsPage(0); setSearchQuery(text) }} />
                </View>}
                {!(isFormVisible || treeModal) && <CardList
                    data={visits}
                    renderItem={renderVisitItem}
                    pagination
                    onEndReached={() => setVisitsPage(visitsPage + 1)}
                    hasMore={hasMoreVisits}
                />}
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

                {(!isFormVisible && treeModal) && <VisitorDataForm
                    visitId={selectedVisit?.id}
                    onCancel={() => setTreeModal(false)}
                    onSubmit={handleVisitorSubmit}
                />}
                <SaplingRangeModal
                    visible={rangeModalVisible}
                    onClose={() => setRangeModalVisible(false)}
                    onSubmit={(saplings) => {
                        setRangeModalVisible(false);
                        navigation.navigate(
                            Strings.screenNames.getString('BulkAddVisitorData', Strings.english),
                            { saplings, visit: selectedVisit },
                        )
                    }}
                />
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