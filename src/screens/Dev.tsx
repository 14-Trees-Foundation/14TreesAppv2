import { BackHandler, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import InternetBanner from "../components/InternetInfo";
import { deleteDummyTrees, generateDummyTrees } from "../services/dev/dummy";
import { useEffect, useState } from "react";
import { Utils } from "../services/Utils";
import Autocomplete from "../components/AutocompleteModal";
import { Strings } from "../services/Strings";
import { DaoClient } from "../services/db/dao";
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

const Dev: React.FC<{ navigation: any }> = ({ navigation }) => {

    const [count, setCount] = useState(1);
    const [plantTypes, setPlantTypes] = useState<any[]>([]);
    const [plots, setPlots] = useState<any[]>([]);
    const [selectedPlantType, setSelectedPlantType] = useState<any>(null);
    const [selectedPlot, setSelectedPlot] = useState<any>(null);
    const [sqlQuery, setSqlQuery] = useState('');
    const [queryResults, setQueryResults] = useState<string>('');
    const [extractionStatus, setExtractionStatus] = useState<string>('');
    const [clearStatus, setClearStatus] = useState<string>('');

    useEffect(() => {
        const backAction = () => {
            navigation.goBack()
            return true; // Prevent default behavior (exit app)
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [])

    useEffect(() => {
        setTimeout(async () => {
            try {
                const daoClient = await DaoClient.authenticate();
                const plantTypes = await daoClient.plantTypes.getPlantTypes(0, -1);
                setPlantTypes(plantTypes);
                const plots = await daoClient.plots.getPlots(0, -1);
                setPlots(plots);
            } catch (error: any) {
                console.error(error);
                const stackTrace = error.stack;
                const errorLog = {
                    msg: 'happened while trying to fetch tree details from local db(loadDataCallback())',
                    error: JSON.stringify(error),
                    stackTrace: stackTrace,
                };

                await Utils.logException(JSON.stringify(errorLog));
            }
        }, 10);
    }, []);

    const handleSetCount = (text: string) => {
        if (text === '') {
            setCount(0);
            return;
        }
        const count = parseInt(text);
        if (isNaN(count)) return;
        setCount(count);
    }

    const handleRunQuery = async () => {
        if (!sqlQuery.trim()) return;
        try {
            const daoClient = await DaoClient.authenticate();
            const results = await daoClient.runQuery(sqlQuery);
            setQueryResults(JSON.stringify(results, null, 2));
        } catch (error: any) {
            setQueryResults(`Error: ${error.message}`);
        }
    }

    const handleExtractSqlite = async () => {
        try {
            setExtractionStatus('Extracting...');
            const assetPath = 'sqlite3'; // in assets
            const destPath = '/data/local/tmp/sqlite3';
            await RNFS.copyFileAssets(assetPath, destPath);
            await RNFS.chmod(destPath, '755');
            setExtractionStatus('SQLite binary extracted to /data/local/tmp/sqlite3');
        } catch (error: any) {
            setExtractionStatus(`Error: ${error.message}`);
        }
    }

    const handleClearAsyncStorage = async () => {
        try {
            setClearStatus('Clearing...');
            await AsyncStorage.clear();
            setClearStatus('AsyncStorage cleared successfully');
        } catch (error: any) {
            setClearStatus(`Error: ${error.message}`);
        }
    }

    return (
        <View style={{ height: '100%', width: '100%' }}>
            <InternetBanner />
            <ScrollView style={styles.screen}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'black' }}>Test</Text>
                </View>
                <View style={{ marginTop: 10 }}>
                    <TextInput
                        value={count ? count.toString() : ''}
                        label={'Count'}
                        onChangeText={handleSetCount}
                        mode='outlined'
                    />
                </View>

                <View style={{ marginTop: 10 }}>
                    <Autocomplete
                        value={selectedPlantType}
                        options={plantTypes}
                        label={Strings.labels.SelectTreeType}
                        onSelect={(data) => { setSelectedPlantType(data); }}
                        valueGetter={(data) => data.name}
                        keyGetter={(data) => data.id}
                        variant='outlined'
                    />
                </View>

                <View style={{ marginTop: 10 }}>
                    <Autocomplete
                        value={selectedPlot}
                        options={plots}
                        label={Strings.labels.SelectPlot}
                        onSelect={(data) => { setSelectedPlot(data); }}
                        valueGetter={(data) => data.name}
                        keyGetter={(data) => data.id}
                        variant='outlined'
                    />
                </View>
                <View style={{ marginTop: 10 }}>
                    <Button
                        onPress={() => generateDummyTrees(count, selectedPlantType.id, selectedPlot.id)}
                        mode='contained-tonal'
                        buttonColor="#93faa9"
                        style={{ marginTop: 20, marginBottom: 10 }}
                    >Add Dummy Trees</Button>
                    <Button onPress={() => deleteDummyTrees()} mode='contained-tonal' buttonColor="#FF6666">Delete Dummy Trees</Button>
                </View>

                <View style={{ marginTop: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>SQLite Binary</Text>
                    <Button
                        onPress={handleExtractSqlite}
                        mode='contained-tonal'
                        style={{ marginTop: 10 }}
                    >Extract SQLite Binary</Button>
                    {extractionStatus ? (
                        <Text style={{ marginTop: 10, color: extractionStatus.startsWith('Error') ? 'red' : 'green' }}>
                            {extractionStatus}
                        </Text>
                    ) : null}
                </View>

                <View style={{ marginTop: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>SQL Query</Text>
                    <TextInput
                        value={sqlQuery}
                        label={'Enter SQL Query'}
                        onChangeText={setSqlQuery}
                        mode='outlined'
                        multiline
                        numberOfLines={4}
                        style={{ marginTop: 10 }}
                    />
                    <Button
                        onPress={handleRunQuery}
                        mode='contained'
                        style={{ marginTop: 10 }}
                    >Run Query</Button>
                </View>

                <View style={{ marginTop: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>AsyncStorage</Text>
                    <Button
                        onPress={handleClearAsyncStorage}
                        mode='contained-tonal'
                        style={{ marginTop: 10 }}
                    >Clear AsyncStorage</Button>
                    {clearStatus ? (
                        <Text style={{ marginTop: 10, color: clearStatus.startsWith('Error') ? 'red' : 'green' }}>
                            {clearStatus}
                        </Text>
                    ) : null}
                </View>

                {queryResults ? (
                    <View style={{ marginTop: 20, flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>Results:</Text>
                        <ScrollView style={{ maxHeight: 300, borderWidth: 1, borderColor: '#ccc', padding: 10, marginTop: 10 }}>
                            <Text>{queryResults}</Text>
                        </ScrollView>
                    </View>
                ) : null}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: '#fffffe',
        flex: 1,
        marginVertical: 20,
        marginHorizontal: 5,
        padding: 10,
        borderRadius: 10,
        elevation: 4,
        opacity: 0.7
    },
    chip: {
        backgroundColor: 'white',
        flexGrow: 1,
        marginHorizontal: 2
    }
});

export default Dev;