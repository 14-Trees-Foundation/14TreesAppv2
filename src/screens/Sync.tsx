import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { BackHandler, ScrollView, StyleSheet, ToastAndroid, View } from "react-native";
import { Button, Chip, Icon, ProgressBar, Text } from "react-native-paper";
import { Constants, Utils, formatDuration, getHumanReadableDateTime, getReadableProgress, getTimeDiffString } from "../services/Utils";
import { DaoClient } from "../services/db/dao";
import { fetchDeltaChanges, uploadLocalData } from "../services/sync/sync";
import { Strings } from "../services/Strings";
import InternetBanner from "../components/InternetInfo";
import GlobalContext from "../context/GlobalContext ";
import { useFocusEffect } from "@react-navigation/native";
import SyncCard from "../components/SyncCard";
import NetworkSpeedModal from "../components/NetworkModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MessageModal from "../components/MessageModal";
import { Site } from "../model/sites";

const syncDetailsTemplate = {
    synced_at: '',
    upload_time: 0,
    fetch_time: 0,
    upload_error: '',
    fetch_error: '',
    trees: { add: 0, edit: 0, delete: 0 },
    users: { add: 0, edit: 0, delete: 0 },
    tree_images: { add: 0, delete: 0 },
    visit_images: { add: 0, delete: 0 },
}

const Sync: React.FC<{ navigation: any }> = ({ navigation }) => {
    const intervalId = useRef<any>(null);
    const { langChanged, uploadInProgress, setUploadInProgress,
        downloadInProgress, setDownloadInProgress, currentSyncTime, setCurrentSyncTime,
        syncProgress, setSyncProgress
    } = useContext(GlobalContext);
    useEffect(() => {
        console.log('langChanged inside SyncScreen: ', langChanged);
    }, [langChanged]);

    const [remaining, setRemaining] = useState(syncDetailsTemplate)
    const [currentSyncDetails, setCurrentSyncDetails] = useState(syncDetailsTemplate)

    const [state, setState] = useState(0);
    const [syncDisabled, setSyncDisabled] = useState(true);
    const [stoppingSync, setStoppingSync] = useState(false);
    const [internetSpeedCheck, setInternetSpeedCheck] = useState(false);
    const [networkSpeed, setNetworkSpeed] = useState<string>('');
    const [lastSyncDate, setLastSyncDate] = useState('');
    const [userChanges, setUserChanges] = useState<any>(null);
    const [treeChanges, setTreeChanges] = useState<any>(null);
    const [treeImagesCount, setTreeImagesCount] = useState<any>(null);
    const [visitImagesCount, setVisitImagesCount] = useState<any>(null);
    const [syncInfoList, setSyncInfoList] = useState<any[]>([]);
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);

    useEffect(() => {
        const backAction = () => {
            navigation.goBack()
            return true; // Prevent default behavior (exit app)
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [])

    useFocusEffect(
        useCallback(() => {
            // Update last sync date on UI every 2 second (2000 milliseconds)
            intervalId.current = setInterval(updateUI, 2000);
            fetchSelectedSite();

            return () => {
                clearInterval(intervalId.current);
            }
        }, []),
    );

    const updateUI = () => {
        setState(prev => prev + 1);
    }

    const fetchSelectedSite = async () => {
        const selectedSite = await AsyncStorage.getItem(Constants.selectedSite);
        if (selectedSite) {
            return setSelectedSite(JSON.parse(selectedSite));
        }
        return setSelectedSite(null);
    }

    useEffect(() => {
        handleLastSyncDate();
        setPendingUploadCounts();
        handleNetworkSpeed();
    }, [state]);

    const handleLastSyncDate = async () => {
        const lsSate = await Utils.getLastSyncDate();
        if (lsSate) {
            setLastSyncDate(lsSate);
        }
    }

    const handleNetworkSpeed = async () => {
        const speed = await Utils.getNetworkSpeed();
        if (speed) {
            setNetworkSpeed(speed);
        }
    }

    useEffect(() => {
        setRemaining(prev => ({
            ...prev,
            trees: treeChanges ? {
                add: treeChanges?.add || 0,
                edit: treeChanges?.edit || 0,
                delete: treeChanges?.delete || 0,
            } : prev.trees,
            users: userChanges ? {
                add: userChanges?.add || 0,
                edit: userChanges?.edit || 0,
                delete: userChanges?.delete || 0,
            } : prev.users,
            tree_images: treeImagesCount ? {
                add: treeImagesCount?.add || 0,
                delete: treeImagesCount?.delete || 0,
            } : prev.tree_images,
            visit_images: visitImagesCount ? {
                add: visitImagesCount?.add || 0,
                delete: visitImagesCount?.delete || 0,
            } : prev.visit_images,
        }));
    }, [userChanges, treeChanges, treeImagesCount, visitImagesCount]);

    useEffect(() => {
        const pending = remaining.users.add + remaining.users.edit + remaining.users.delete
            + remaining.trees.add + remaining.trees.edit + remaining.trees.delete
            + remaining.tree_images.add + remaining.tree_images.delete
            + remaining.visit_images.delete + remaining.visit_images.delete

        if (pending === 0) setSyncDisabled(true);
        else setSyncDisabled(false);

        if (uploadInProgress && currentSyncTime) {
            const updateCurrentSyncInfo = async () => {
                let syncInfo: any = await Utils.getSyncInfoBySyncTime(currentSyncTime);
                syncInfo = { ...syncInfo, key: syncInfo.local_id } 

                const completed = syncInfo.users.add + syncInfo.users.edit + syncInfo.users.delete
                    + syncInfo.trees.add + syncInfo.trees.edit + syncInfo.trees.delete
                    + syncInfo.tree_images.add + syncInfo.tree_images.delete
                    + syncInfo.visit_images.delete + syncInfo.visit_images.delete


                if (pending + completed !== 0) {
                    const progress = completed / (pending + completed);
                    setSyncProgress((prev: any) => prev < progress ? progress : prev);
                }
                else setSyncProgress(0);

                setCurrentSyncDetails(syncInfo);
            }
            updateCurrentSyncInfo();
        }
    }, [state, uploadInProgress, currentSyncTime, remaining])

    const getSyncInfo = async () => {
        const daoClient = await DaoClient.authenticate();
        const syncInfoList = await daoClient.syncInfo.getSyncInfo();
        const list: any[] = syncInfoList.map(item => {
            const data: any = item;
            data.key = item.local_id;
            data.trees = JSON.parse(item.trees)
            data.tree_images = JSON.parse(item.tree_images)
            data.visit_images = JSON.parse(item.visit_images)
            data.users = item.users ? JSON.parse(item.users) : syncDetailsTemplate.users

            return data;
        })
        setSyncInfoList(list);
    }

    useFocusEffect(
        useCallback(() => {
            getSyncInfo();
            return () => {
            };
        }, [])
    );

    const uploadData = async (netSpeedInKBps: number) => {
        setNetworkSpeed(netSpeedInKBps.toFixed(0))
        const localChangesCount = {
            users: {
                add: userChanges?.add || 0,
                edit: userChanges?.edit || 0,
                delete: userChanges?.delete || 0,
            },
            trees: {
                add: treeChanges?.add || 0,
                edit: treeChanges?.edit || 0,
                delete: treeChanges?.delete || 0,
            },
            tree_images: {
                add: treeImagesCount?.add || 0,
                delete: treeImagesCount?.delete || 0,
            },
            visit_images: {
                add: visitImagesCount?.add || 0,
                delete: visitImagesCount?.delete || 0,
            },
        }

        const syncDetails = {
            synced_at: new Date().toISOString(),
            upload_time: 0,
            fetch_time: 0,
            upload_error: '',
            fetch_error: '',
            ...localChangesCount
        }

        setSyncProgress(0);
        setCurrentSyncTime(syncDetails.synced_at);
        setUploadInProgress(true);
        setCurrentSyncDetails(prev => {
            return {
                ...prev,
                synced_at: syncDetails.synced_at,
            }
        })
        await saveSyncInfo({ ...syncDetailsTemplate, synced_at: syncDetails.synced_at });

        let timeNow = new Date().getTime();

        try {
            await uploadLocalData(localChangesCount, syncDetails.synced_at);
        } catch (error: any) {
            syncDetails.upload_error = error.message;
            const stackTrace = error.stack;
            const errorLog = {
                msg: 'happened while trying to sync Local changes(inside sync display)',
                error: JSON.stringify(error),
                stackTrace: stackTrace,
            };
            await Utils.logException(JSON.stringify(errorLog));
        }

        syncDetails.upload_time = new Date().getTime() - timeNow;

        const daoClient = await DaoClient.authenticate();
        const syncInfo = await daoClient.syncInfo.getSyncInfoBySyncTime(syncDetails.synced_at);
        syncInfo.upload_error = syncDetails.upload_error;
        syncInfo.upload_time = syncDetails.upload_time;
        await daoClient.syncInfo.createSyncInfo(syncInfo);
        getSyncInfo();

        setUploadInProgress(false);
        setCurrentSyncTime(null);
        setStoppingSync(false);
        Utils.setLastSyncDateNow();
        Utils.removeNetworkSpeed();
    }

    const stopUploadData = async () => {
        setStoppingSync(true);
        await AsyncStorage.setItem(Constants.isForceSyncStop, 'true');
    }

    const fetchData = async () => {
        if (selectedSite === null) {
            ToastAndroid.show('Please select a site first!', ToastAndroid.SHORT);
            return;
        }
        setSyncProgress(0);
        setDownloadInProgress(true);
        try {
            await fetchDeltaChanges(setSyncProgress);
        } catch (error: any) {
            const stackTrace = error.stack;
            const errorLog = {
                msg: 'happened while trying to download changes(inside sync display)',
                error: JSON.stringify(error),
                stackTrace: stackTrace,
            };
            await Utils.logException(JSON.stringify(errorLog));
        }
        setDownloadInProgress(false);
    }

    const saveSyncInfo = async (info: any) => {
        const data = JSON.parse(JSON.stringify(info)); // copy

        data.trees = JSON.stringify(data.trees);
        data.tree_images = JSON.stringify(data.tree_images);
        data.visit_images = JSON.stringify(data.visit_images);
        data.users = JSON.stringify(data.users);
        const daoClient = await DaoClient.authenticate();
        await daoClient.syncInfo.createSyncInfo(data);
    }

    const setPendingUploadCounts = async () => {
        const daoClient = await DaoClient.authenticate();
        const treesResp = await daoClient.trees.countTreesByChangeTye();
        setTreeChanges(treesResp)

        const visitImagesResp = await daoClient.visitImages.countVisitImages(false);
        setVisitImagesCount(visitImagesResp);

        const treeImagesResp = await daoClient.treeSnapshots.countTreeSnapshotImages(false);
        setTreeImagesCount(treeImagesResp);

        const usersResp = await daoClient.users.countUsersByChangeTye(false);
        setUserChanges(usersResp);
    }

    const getRemainingUploadTime = () => {
        let items = 0;
        if (userChanges?.add) items += userChanges?.add;
        if (userChanges?.edit) items += userChanges?.edit;
        if (treeChanges?.add) items += treeChanges?.add;
        if (treeChanges?.edit) items += treeChanges?.edit;
        if (treeImagesCount?.add) items += treeImagesCount?.add;
        if (visitImagesCount?.add) items += visitImagesCount?.add;
        if (items === 0) return 'few seconds'
        return formatDuration((items * 1024 * 1000) / parseInt(networkSpeed))
    }

    const getNetworkSpeed = () => {
        let speed = networkSpeed + ' KBps'
        if (parseInt(networkSpeed) >= 1024) {
            speed = (parseInt(networkSpeed) / 1024).toFixed(2) + ' MBps'
        }
        return speed
    }

    const handleUploadButtonPress = () => {
        if (uploadInProgress) {
            stopUploadData()
        } else {
            setInternetSpeedCheck(true)
        }
    }

    const getChipIcon = (props: any, synced: boolean) => {
        return (
            <Icon source={'cloud-sync-outline'} size={props.size} color={synced ? "green" : "red"} />
        )
    }

    return (
        <View style={{ height: '100%', width: '100%' }}>
            <InternetBanner />
            <View style={styles.screen}>
                <ScrollView style={{ flex: 1, width: '100%' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Button
                            mode='contained-tonal'
                            icon={'download'}
                            loading={downloadInProgress}
                            buttonColor="#93faa9"
                            labelStyle={{ color: 'black', fontWeight: 'bold' }}
                            style={{ marginHorizontal: 4, flexGrow: 1, marginBottom: 10 }}
                            disabled={downloadInProgress || uploadInProgress}
                            onPress={fetchData}
                        >{Strings.buttonLabels.DownloadSitesPlots}</Button>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text variant='titleMedium' style={{ color: 'black', fontWeight: 'bold', paddingRight: 8 }}>{Strings.messages.LastSynced}</Text>
                        <Chip icon='cloud-sync-outline' style={styles.chip} >
                            {lastSyncDate === '' ? Strings.messages.Never : getTimeDiffString(lastSyncDate)}
                        </Chip>
                    </View>

                    <View style={{ marginTop: 20 }}>
                        <Text variant='titleLarge' style={{ color: 'black', fontWeight: 'bold', paddingRight: 10 }}>{Strings.messages.LocalChanges}:</Text>
                        <View style={{ justifyContent: 'center', marginVertical: 5 }}>
                            <Text variant='titleMedium' style={{ color: 'black', paddingRight: 10 }}>{Strings.messages.Users}:</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                                <Chip icon={(props => getChipIcon(props, userChanges?.add === undefined))} style={styles.chip} >{Strings.messages.New}: {userChanges?.add || 0}</Chip>
                                <Chip icon={(props => getChipIcon(props, userChanges?.edit === undefined))} style={styles.chip} >{Strings.messages.Updated}: {userChanges?.edit || 0}</Chip>
                                <Chip icon={(props => getChipIcon(props, userChanges?.delete === undefined))} style={styles.chip} >{Strings.messages.Deleted}: {userChanges?.delete || 0}</Chip>
                            </View>
                        </View>
                        <View style={{ justifyContent: 'center', marginVertical: 5 }}>
                            <Text variant='titleMedium' style={{ color: 'black', paddingRight: 10 }}>{Strings.messages.Trees}:</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                                <Chip icon={(props => getChipIcon(props, treeChanges?.add === undefined))} style={styles.chip} >{Strings.messages.New}: {treeChanges?.add || 0}</Chip>
                                <Chip icon={(props => getChipIcon(props, treeChanges?.edit === undefined))} style={styles.chip} >{Strings.messages.Updated}: {treeChanges?.edit || 0}</Chip>
                                <Chip icon={(props => getChipIcon(props, treeChanges?.delete === undefined))} style={styles.chip} >{Strings.messages.Deleted}: {treeChanges?.delete || 0}</Chip>
                            </View>
                        </View>
                        <View style={{ justifyContent: 'center', marginVertical: 5 }}>
                            <Text variant='titleMedium' style={{ color: 'black', paddingRight: 10 }}>{Strings.messages.TreeImages}:</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                                <Chip icon={(props => getChipIcon(props, !(treeImagesCount?.add)))} style={styles.chip} >{Strings.messages.New}: {treeImagesCount?.add || 0}</Chip>
                                <Chip icon={(props => getChipIcon(props, !(treeImagesCount?.delete)))} style={styles.chip} >{Strings.messages.Deleted}: {treeImagesCount?.delete || 0}</Chip>
                            </View>
                        </View>
                        <View style={{ justifyContent: 'center', marginVertical: 5 }}>
                            <Text variant='titleMedium' style={{ color: 'black', paddingRight: 10 }}>{Strings.messages.VisitImages}:</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                                <Chip icon={(props => getChipIcon(props, !(visitImagesCount?.add)))} style={styles.chip} >{Strings.messages.New}: {visitImagesCount?.add || 0}</Chip>
                                <Chip icon={(props => getChipIcon(props, !(visitImagesCount?.delete)))} style={styles.chip} >{Strings.messages.Deleted}: {visitImagesCount?.delete || 0}</Chip>
                            </View>
                        </View>
                    </View>

                    <View style={{ marginTop: 20, justifyContent: 'center' }}>
                        <Button
                            icon={uploadInProgress ? 'stop-circle-outline' : 'upload'}
                            mode='contained-tonal'
                            buttonColor={uploadInProgress ? "#FF6666" : "#93faa9"}
                            labelStyle={{ color: 'black', fontWeight: 'bold' }}
                            style={{ marginHorizontal: 4, flexGrow: 1 }}
                            onPress={handleUploadButtonPress}
                            disabled={syncDisabled || downloadInProgress}
                        >{uploadInProgress ? Strings.buttonLabels.StopUpload : Strings.buttonLabels.UploadData}</Button>
                    </View>

                    {!(uploadInProgress || downloadInProgress) && syncInfoList.length !== 0 && <View style={{ flex: 1, width: '100%', marginTop: 20 }}>
                        <Text variant='titleLarge' style={{ color: 'black', fontWeight: 'bold', paddingRight: 10 }}>{Strings.messages.SyncHistory}:</Text>
                        <ScrollView style={{ flex: 1, width: '100%' }}>
                            {
                                syncInfoList.map(info => (
                                    <View key={info.key} style={{ marginHorizontal: 5, marginVertical: 3 }}>
                                        <SyncCard
                                            syncedAt={info.synced_at === '' ? '' : getHumanReadableDateTime(info.synced_at)}
                                            trees={info.trees}
                                            users={info.users}
                                            treeImages={info.tree_images}
                                            visitImages={info.visit_images}
                                            uploadTime={info.upload_time}
                                            fetchTime={info.fetch_time}
                                            fetchError={info.fetch_error !== '' ? info.fetch_error : null}
                                            uploadError={info.upload_error !== '' ? info.upload_error : null}
                                        />
                                    </View>
                                ))
                            }
                        </ScrollView>
                    </View>}

                    {uploadInProgress && <View style={{ flex: 1, width: '100%', marginTop: 20 }}>
                        <Text variant='titleLarge' style={{ color: 'black', fontWeight: 'bold', paddingRight: 10 }}>{Strings.messages.CurrentSync}:</Text>
                        <View style={{ marginHorizontal: 5, marginVertical: 3 }}>
                            <SyncCard
                                syncedAt={currentSyncDetails.synced_at === '' ? '' : getHumanReadableDateTime(currentSyncDetails.synced_at)}
                                trees={currentSyncDetails.trees}
                                users={currentSyncDetails.users}
                                treeImages={currentSyncDetails.tree_images}
                                visitImages={currentSyncDetails.visit_images}
                                uploadTime={currentSyncDetails.upload_time}
                                fetchTime={currentSyncDetails.fetch_time}
                                fetchError={currentSyncDetails.fetch_error !== '' ? currentSyncDetails.fetch_error : null}
                                uploadError={currentSyncDetails.upload_error !== '' ? currentSyncDetails.upload_error : null}
                            />
                        </View>
                    </View>}
                </ScrollView>

                {(uploadInProgress || downloadInProgress) && <View
                    style={{ marginHorizontal: 10, marginVertical: 10 }}>
                    <Text style={{ textAlign: 'center', marginBottom: 5 }}>
                        {uploadInProgress && networkSpeed !== ''
                            ? 'Remaining Time ' + getRemainingUploadTime() + ` (${getNetworkSpeed()})`
                            : ''}
                    </Text>
                    <Text style={{ textAlign: 'center', marginBottom: 5 }}>
                        {uploadInProgress
                            ? Strings.messages.UploadingLocal
                            : Strings.messages.FetchingChanges}
                    </Text>
                    <ProgressBar visible={uploadInProgress || downloadInProgress} progress={syncProgress} style={{ backgroundColor: '#bf8686' }} fillStyle={{ backgroundColor: '#02ab4e' }} />
                    <Text style={{ textAlign: 'center', marginTop: 2 }}>{Strings.messages.Completed}: {getReadableProgress(syncProgress)}</Text>
                </View>}

                <NetworkSpeedModal
                    dataSize={(treeChanges?.add || 0) * 1024 * 1024 * 8}
                    visible={internetSpeedCheck}
                    onClose={() => setInternetSpeedCheck(false)}
                    onSubmit={uploadData}
                />

                <MessageModal
                    visible={stoppingSync}
                    text={"Stopping the sync. Please wait..."}
                />

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

export default Sync;