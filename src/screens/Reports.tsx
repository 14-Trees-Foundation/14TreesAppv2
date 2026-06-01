import { useCallback, useContext, useEffect, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import GlobalContext from "../context/GlobalContext ";
import { useFocusEffect } from "@react-navigation/native";
import { ApiClient } from "../services/api/api";
import { TreePlantationInfo } from "../model/tree";
import CardList from "../components/CardList";
import PlantationInfoCard from "../components/reports/PlantationInfoCard";
import { Text } from "react-native-paper";
import { DatePicker } from "../components/DatePicker";
import { FilterItem } from "../model/common";

interface ReportsIProps {
    navigation: any
}

const Reports: React.FC<ReportsIProps> = ({ navigation }) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const { langChanged } = useContext(GlobalContext);
    useEffect(() => {
        console.log('langChanged inside Reports: ', langChanged);
    }, [langChanged]);

    const [treesPlantationInfo, setTreesPlantationInfo] = useState<TreePlantationInfo[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [lowerBound, setLowerBound] = useState(yesterday);
    const [upperBound, setUpperBound] = useState(today);


    useFocusEffect(
        useCallback(() => {
            const backAction = () => {
                navigation.goBack();
                return true;
            };

            const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
            return () => backHandler.remove();
        }, [navigation])
    );

    useEffect(() => {
        getTreePlantationCount(page, lowerBound, upperBound);
    }, [page, lowerBound, upperBound]);

    const getTreePlantationCount = async (page: number, lowerBound: Date, upperBound: Date) => {
        const lower = lowerBound.toISOString().slice(0, 10) + 'T00:00:00Z';
        const upper = upperBound.toISOString().slice(0, 10) + 'T23:59:59Z';

        const filters: FilterItem[] = [
            { columnField: 'created_at', operatorValue: 'between', value: [lower, upper] }
        ]

        const apiClient = new ApiClient();
        const resp = await apiClient.trees.getTreesPlantationInfo(page * 10, 10, filters);
        setTreesPlantationInfo(prev => [...prev.slice(0, resp.offset), ...resp.results]);

        if (resp.offset + resp.results.length >= resp.total) setHasMore(false);
        else setHasMore(true);
    };

    const renderUserItem = (info: TreePlantationInfo, index: number) => {
        return (
            <View style={{ width: '100%', paddingHorizontal: 10 }}>
                <PlantationInfoCard info={info} />
            </View>
        );
    };

    return (
        <View style={statsStyles.container}>
            <View style={statsStyles.header}>
                <Text variant='titleMedium' style={statsStyles.title}>Trees Plantation Report</Text>
                <View style={statsStyles.dateView}>
                    <Text variant='labelLarge'>Select Start Date: </Text>
                    <View style={statsStyles.datePicker}>
                        <DatePicker 
                            value={lowerBound}
                            onChange={(date) => { setPage(0); setLowerBound(date); }}
                            style={{ height: 30, justifyContent: 'center' }}
                        />
                    </View>
                </View>
                <View style={statsStyles.dateView}>
                    <Text variant='labelLarge'>Select End Date: </Text>
                    <View style={statsStyles.datePicker}>
                        <DatePicker 
                            value={upperBound}
                            onChange={(date) => { setPage(0); setUpperBound(date); }}
                            style={{ height: 30, justifyContent: 'center' }}
                        />
                    </View>
                </View>
            </View>
            <CardList
                data={treesPlantationInfo}
                renderItem={renderUserItem}
                pagination
                onEndReached={() => { if(hasMore) setPage(page + 1) }}
                hasMore={hasMore}
            />
        </View>
    );
}

const statsStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E5E5E5',
        alignItems: 'center',
    },
    header: {
        padding: 10,
        paddingTop: 20,
        width: '100%',
        backgroundColor: 'white',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    dateView: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    datePicker: { 
        maxWidth: '60%', 
        flexGrow: 1 
    }
});

export default Reports;
