import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Chip, ProgressBar, Text } from "react-native-paper";
import { Utils, getTimeDiffString } from "../services/Utils";

const Sync: React.FC<{}> = () => {

    const [state, setState] = useState(0);
    const [lastSyncDate, setLastSyncDate] = useState('');

    useEffect(() => {
        handleLastSyncDate()
    }, [state]);

    const handleLastSyncDate = async () => {
        const lsSate = await Utils.getLastSyncDate();
        if (lsSate) {
            setLastSyncDate(lsSate);
        }
    }

    return (
        <View style={styles.screen}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text variant='titleMedium' style={{ color: 'black', fontWeight: 'bold', paddingRight: 10 }}>Last Synced At:</Text>
                <Chip icon='cloud-sync-outline' style={{ backgroundColor: 'white', flexGrow: 1 }} >
                    {lastSyncDate === '' ? 'Never' : getTimeDiffString(lastSyncDate)}
                </Chip>  
            </View>

            <View style={{ marginTop: 20 }}>
                <Text variant='titleLarge' style={{ color: 'black', fontWeight: 'bold', paddingRight: 10 }}>Local Changes:</Text>
                <View style={{ justifyContent: 'center', marginVertical: 5 }}>
                    <Text variant='titleMedium' style={{ color: 'black', paddingRight: 10 }}>Trees:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                        <Chip icon='cloud-sync-outline' style={{ backgroundColor: 'white', flexGrow: 1, marginHorizontal: 2 }} >New: </Chip>
                        <Chip icon='cloud-sync-outline' style={{ backgroundColor: 'white', flexGrow: 1, marginHorizontal: 2 }} >Updated: </Chip>
                        <Chip icon='cloud-sync-outline' style={{ backgroundColor: 'white', flexGrow: 1, marginHorizontal: 2 }} >Deleted: </Chip>
                    </View>
                </View>
                <View style={{ justifyContent: 'center', marginVertical: 5 }}>
                    <Text variant='titleMedium' style={{ color: 'black', paddingRight: 10 }}>Visit Images:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                        <Chip icon='cloud-sync-outline' style={{ backgroundColor: 'white', flexGrow: 1, marginHorizontal: 2 }} >New: </Chip>
                    </View>
                </View>
            </View>

            <View style={{ marginTop: 20, justifyContent: 'center' }}>
                <Button mode='contained-tonal' buttonColor="#93faa9" labelStyle={{ color: 'black', fontWeight: 'bold' }}>Sync</Button>
            </View>

            <View 
                style={{ position: 'absolute', bottom: 70, left: 20, right: 20 }}>
                <ProgressBar visible progress={0.4} style={{backgroundColor: '#bf8686'}} fillStyle={{ backgroundColor: '#02ab4e' }} />
                <Text style={{ textAlign: 'center', marginTop: 2}}>Completed: 40%</Text>
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
});

export default Sync;