import { useEffect, useState } from "react";
import { BackHandler, StyleSheet, ToastAndroid, View } from "react-native";
import { Button, Chip, Icon, ProgressBar, Text } from "react-native-paper";
import { Utils, getTimeDiffString } from "../services/Utils";
import { DaoClient } from "../services/db/dao";
import { fetchDeltaChanges, uploadLocalData } from "../services/sync/sync";
import { Loading } from "../components/Loading";

const getReadableProgress = (progress: number) => {
    return Math.round(progress * 100).toString() + '%';
}

const Sync: React.FC<{navigation: any}> = ({ navigation }) => {

    const [state, setState] = useState(0);
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(0);
    const [syncType, setSyncType] = useState<'upload' | 'fetch'>('upload');
    const [lastSyncDate, setLastSyncDate] = useState('');
    const [treeChanges, setTreeChanges] = useState<any>(null);
    const [treeImagesCount, setTreeImagesCount] = useState(0);
    const [visitImagesCount, setVisitImagesCount] = useState(0);

    useEffect(() => {
        const backAction = () => {
          navigation.goBack()
          return true; // Prevent default behavior (exit app)
        };
    
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [])

    useEffect(() => {
        handleLastSyncDate();
        setPendingUploadCounts();
    }, [state]);

    const handleLastSyncDate = async () => {
        const lsSate = await Utils.getLastSyncDate();
        if (lsSate) {
            setLastSyncDate(lsSate);
        }
    }

    const handleSync = async () => {
        const localChangesCount = {
            trees: {
                add: treeChanges?.add || 0,
                edit: treeChanges?.edit || 0,
                delete: treeChanges?.delete || 0,
            },
            tree_images: treeImagesCount,
            visit_images: visitImagesCount,
        }

        setSyncType('upload');
        setProgress(0);
        setVisible(true);

        try {
            await uploadLocalData(setProgress, localChangesCount);
        } catch(error: any) {
            const stackTrace = error.stack;
            const errorLog = {
            msg: 'happened while trying to sync tree images(inside sync display)',
            error: JSON.stringify(error),
            stackTrace: stackTrace,
            };
            await Utils.logException(JSON.stringify(errorLog));
        }

        setState(prev => prev + 1);
        
        setSyncType('fetch');
        setProgress(0);
        try {
            await fetchDeltaChanges(setProgress);
        } catch(error: any) {
            const stackTrace = error.stack;
            const errorLog = {
            msg: 'happened while trying to sync tree images(inside sync display)',
            error: JSON.stringify(error),
            stackTrace: stackTrace,
            };
            await Utils.logException(JSON.stringify(errorLog));
        }
        
        setVisible(false);
        Utils.setLastSyncDateNow();
        setState(prev => prev + 1);
    }

    const setPendingUploadCounts = async () => {
        const daoClient = await DaoClient.authenticate();
        const treesResp = await daoClient.trees.countTreesByChangeTye();
        setTreeChanges(treesResp)

        const visitImagesResp = await daoClient.visitImages.countVisitImages(false);
        setVisitImagesCount(visitImagesResp);

        const treeImagesResp = await daoClient.treeSnapshots.countTreeSnapshotImages(false);
        setTreeImagesCount(treeImagesResp);
    }

    const getChipIcon = (props: any, synced: boolean) => {
        return (
            <Icon source={'cloud-sync-outline'} size={props.size} color={ synced ? "green" : "red"}/>
        )
    }

    return (
        <View style={styles.screen}>
            <Loading loading={visible}/>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text variant='titleMedium' style={{ color: 'black', fontWeight: 'bold', paddingRight: 8 }}>Last Synced:</Text>
                <Chip icon='cloud-sync-outline' style={styles.chip} >
                    {lastSyncDate === '' ? 'Never' : getTimeDiffString(lastSyncDate)}
                </Chip>  
            </View>

            <View style={{ marginTop: 20 }}>
                <Text variant='titleLarge' style={{ color: 'black', fontWeight: 'bold', paddingRight: 10 }}>Local Changes:</Text>
                <View style={{ justifyContent: 'center', marginVertical: 5 }}>
                    <Text variant='titleMedium' style={{ color: 'black', paddingRight: 10 }}>Trees:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                        <Chip icon={(props => getChipIcon(props, treeChanges?.add === undefined))} style={styles.chip} >New: {treeChanges?.add || 0}</Chip>
                        <Chip icon={(props => getChipIcon(props, treeChanges?.edit === undefined))} style={styles.chip} >Updated: {treeChanges?.edit || 0}</Chip>
                        <Chip icon={(props => getChipIcon(props, treeChanges?.delete === undefined))} style={styles.chip} >Deleted: {treeChanges?.delete || 0}</Chip>
                    </View>
                </View>
                <View style={{ justifyContent: 'center', marginVertical: 5 }}>
                    <Text variant='titleMedium' style={{ color: 'black', paddingRight: 10 }}>Tree Images:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                        <Chip icon={(props => getChipIcon(props, treeImagesCount === 0))} style={styles.chip} >New: {treeImagesCount}</Chip>
                    </View>
                </View>
                <View style={{ justifyContent: 'center', marginVertical: 5 }}>
                    <Text variant='titleMedium' style={{ color: 'black', paddingRight: 10 }}>Visit Images:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                        <Chip icon={(props => getChipIcon(props, visitImagesCount === 0))} style={styles.chip}>New: {visitImagesCount}</Chip>
                    </View>
                </View>
            </View>

            <View style={{ marginTop: 20, justifyContent: 'center' }}>
                <Button 
                    mode='contained-tonal' 
                    buttonColor="#93faa9" 
                    labelStyle={{ color: 'black', fontWeight: 'bold' }}
                    onPress={() => handleSync()}
                >Sync</Button>
            </View>

            {visible && <View 
                style={{ position: 'absolute', bottom: 70, left: 20, right: 20 }}>
                <Text style={{ textAlign: 'center', marginBottom: 5}}>
                    {syncType === 'upload' 
                                    ? 'Uploading Local Changes!' 
                                    : 'Fetching New Changes from Server!' }
                </Text>
                <ProgressBar visible={visible} progress={progress} style={{backgroundColor: '#bf8686'}} fillStyle={{ backgroundColor: '#02ab4e' }} />
                <Text style={{ textAlign: 'center', marginTop: 2}}>Completed: {getReadableProgress(progress)}</Text>
            </View>}

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

export default Sync;