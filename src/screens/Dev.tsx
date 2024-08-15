import { BackHandler, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import InternetBanner from "../components/InternetInfo";
import { deleteDummyTrees, generateDummyTrees } from "../services/dev/dummy";
import { useEffect, useState } from "react";
import { Utils } from "../services/Utils";
import Autocomplete from "../components/AutocompleteModal";
import { Strings } from "../services/Strings";

const Dev: React.FC<{ navigation: any }> = ({ navigation }) => {

    const [count, setCount] = useState(1);
    const [plantTypes, setPlantTypes] = useState<any[]>([]);
    const [plots, setPlots] = useState<any[]>([]);
    const [selectedPlantType, setSelectedPlantType] = useState<any>(null);
    const [selectedPlot, setSelectedPlot] = useState<any>(null);

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
                let { treeTypes, plots } = await Utils.getLocalTreeTypesAndPlots();
                if (treeTypes) setPlantTypes(treeTypes);
                if (plots) setPlots(plots);
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

    return (
        <View style={{ height: '100%', width: '100%' }}>
            <InternetBanner />
            <View style={styles.screen}>
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
                        keyGetter={(data) => data.value}
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
                        keyGetter={(data) => data.value}
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
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: '#fffffe',
        height: '96%',
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