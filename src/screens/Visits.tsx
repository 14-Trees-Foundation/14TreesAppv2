import { View, Button, BackHandler, ScrollView, SafeAreaView, StyleSheet, TextInput, Text } from "react-native";
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
import { FAB } from "react-native-paper";
import SearchBar from "../components/Searchbar";
import { Image } from "../model/common";

interface VisitsInputProps {
    navigation: any
}

const Visits: React.FC<VisitsInputProps> = ({ navigation }) => {

    const { lightTheme } = useContext(GlobalContext);
    const [stateChange, setStateChange] = useState(0);
    const [isFormVisible, setIsFormVisible] = useState(false);
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
          setStateChange(stateChange + 1);
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
                }
            };

            setStateChange(stateChange + 1);
        }, 1000)
    };

    const handleDelete = () => {
        if (selectedVisit) {
            setTimeout(async () => {
                await daoClient.visits.deleteVisit(selectedVisit.local_id);
                setStateChange(stateChange + 1);
            }, 1000)
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {!isFormVisible && <View style={styles.header}>
                <SearchBar onChange={setSearchQuery}/>
            </View>}
            {!isFormVisible && <ScrollView style={styles.scrollView} contentContainerStyle={{alignItems: 'center'}}>
                {visits.map((visit, index) => (
                    <View style={{ width: '95%' }} key={index}>
                        <TouchableOpacity style={{ width: '100%', alignItems: 'center' }} activeOpacity={0.9} key={index} onPress={() => {
                            setSelectedVisit(visit);
                            setInfoModalVisible(true);
                        }}>
                            <VisitCard
                                visit={visit}
                            />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>}
            {/* {!isFormVisible && <AddIconButton onClick={() => {
                setIsFormVisible(true);
                setSelectedVisit(null);
                setChangeModel('add');
            }} />} */}

            {isFormVisible && <VisitForm
                changeMode={changeMode}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleSave}
                visit={selectedVisit}
            />}

            {selectedVisit && <VisitInfo
                isVisible={isInfoModalVisible}
                onClose={() => { setInfoModalVisible(false) }}
                onEdit={() => { setChangeModel('edit'); setIsFormVisible(true); }}
                onDelete={handleDelete}
                visit={selectedVisit}
            />}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        alignItems: 'center'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 10,
        height: 50,
        width: '95%'
    },
    searchInput: {
        flex: 1,
        width: '80%',
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        marginRight: 10,
        color: 'black'
    },
    buttonAdd: {
        width: '20%',
        height: '100%',
        justifyContent: 'center'
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