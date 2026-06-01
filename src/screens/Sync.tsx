import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, ScrollView, StyleSheet, ToastAndroid, View } from "react-native";
import { Button, Icon, ProgressBar, Text } from "react-native-paper";
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
import { ApiClient } from "../services/api/api";

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

const getLocalDateKey = (dateStr: string): string | null => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatSyncDate = (dateKey: string): string => {
    const date = new Date(dateKey + 'T00:00:00');
    if (isNaN(date.getTime())) return '';
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    return `${day} ${month}`;
};

const getTwoDaysUtcLowerBound = (): string => {
    const now = new Date();
    const lowerBoundUtc = new Date(Date.UTC(
        now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 0, 0, 0, 0,
    ));
    return lowerBoundUtc.toISOString();
};

const getDailySyncSummary = (list: any[]) => {
    const byDate: Record<string, { trees: number; treeImages: number }> = {};
    const uniqueBySyncTime = new Map<string, any>();
    for (const item of list) {
        if (!item?.synced_at) continue;
        const existing = uniqueBySyncTime.get(item.synced_at);
        if (!existing || (item.local_id || item.key || 0) > (existing.local_id || existing.key || 0)) {
            uniqueBySyncTime.set(item.synced_at, item);
        }
    }
    for (const item of uniqueBySyncTime.values()) {
        const dateKey = getLocalDateKey(item.synced_at);
        if (!dateKey) continue;
        if (!byDate[dateKey]) byDate[dateKey] = { trees: 0, treeImages: 0 };
        byDate[dateKey].trees += (item.trees?.add || 0);
        byDate[dateKey].treeImages += (item.tree_images?.add || 0);
    }
    const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));
    const treeDaily = sortedDates
        .filter(d => byDate[d].trees > 0).slice(0, 2)
        .map(d => ({ count: byDate[d].trees, dateStr: formatSyncDate(d) }));
    const treeImagesDaily = sortedDates
        .filter(d => byDate[d].treeImages > 0).slice(0, 2)
        .map(d => ({ count: byDate[d].treeImages, dateStr: formatSyncDate(d) }));
    return { treeDaily, treeImagesDaily };
};

const Sync: React.FC<{ navigation: any }> = ({ navigation }) => {
    const intervalId = useRef<any>(null);
    const { uploadInProgress, setUploadInProgress,
        downloadInProgress, setDownloadInProgress, currentSyncTime, setCurrentSyncTime,
        syncProgress, setSyncProgress
    } = useContext(GlobalContext);

    const [remaining, setRemaining] = useState(syncDetailsTemplate);
    const [currentSyncDetails, setCurrentSyncDetails] = useState(syncDetailsTemplate);
    const [state, setState] = useState(0);
    const [syncDisabled, setSyncDisabled] = useState(true);
    const [stoppingSync, setStoppingSync] = useState(false);
    const [internetSpeedCheck, setInternetSpeedCheck] = useState(false);
    const [networkSpeed, setNetworkSpeed] = useState<string>('');
    const [lastSyncDate, setLastSyncDate] = useState('');
    const [treeChanges, setTreeChanges] = useState<any>(null);
    const [treeImagesCount, setTreeImagesCount] = useState<any>(null);
    const [syncInfoList, setSyncInfoList] = useState<any[]>([]);
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);

    const dailySyncSummary = useMemo(() => getDailySyncSummary(syncInfoList), [syncInfoList]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            navigation.goBack(); return true;
        });
        return () => backHandler.remove();
    }, []);

    useFocusEffect(useCallback(() => {
        intervalId.current = setInterval(() => setState(prev => prev + 1), 2000);
        fetchSelectedSite();
        return () => clearInterval(intervalId.current);
    }, []));

    const fetchSelectedSite = async () => {
        const data = await AsyncStorage.getItem(Constants.selectedSite);
        setSelectedSite(data ? JSON.parse(data) : null);
    };

    useEffect(() => {
        handleLastSyncDate();
        setPendingUploadCounts();
        handleNetworkSpeed();
    }, [state]);

    const handleLastSyncDate = async () => {
        const v = await Utils.getLastSyncDate();
        if (v) setLastSyncDate(v);
    };

    const handleNetworkSpeed = async () => {
        const speed = await Utils.getNetworkSpeed();
        if (speed) setNetworkSpeed(speed);
    };

    useEffect(() => {
        setRemaining(prev => ({
            ...prev,
            trees: treeChanges
                ? { add: treeChanges?.add || 0, edit: treeChanges?.edit || 0, delete: treeChanges?.delete || 0 }
                : prev.trees,
            tree_images: treeImagesCount
                ? { add: treeImagesCount?.add || 0, delete: treeImagesCount?.delete || 0 }
                : prev.tree_images,
        }));
    }, [treeChanges, treeImagesCount]);

    useEffect(() => {
        const pending = remaining.trees.add + remaining.trees.edit + remaining.trees.delete
            + remaining.tree_images.add + remaining.tree_images.delete;

        setSyncDisabled(pending === 0);

        if (uploadInProgress && currentSyncTime) {
            const updateCurrentSyncInfo = async () => {
                let syncInfo: any = await Utils.getSyncInfoBySyncTime(currentSyncTime);
                syncInfo = { ...syncInfo, key: syncInfo.local_id };
                const completed = syncInfo.trees.add + syncInfo.trees.edit + syncInfo.trees.delete
                    + syncInfo.tree_images.add + syncInfo.tree_images.delete;
                if (pending + completed !== 0) {
                    const progress = completed / (pending + completed);
                    setSyncProgress((prev: any) => prev < progress ? progress : prev);
                } else setSyncProgress(0);
                setCurrentSyncDetails(syncInfo);
            };
            updateCurrentSyncInfo();
        }
    }, [state, uploadInProgress, currentSyncTime, remaining]);

    const getSyncInfo = async () => {
        try {
            const userDataStr = await AsyncStorage.getItem(Constants.userDetailsKey);
            if (!userDataStr) throw new Error("Current user's details not found");
            const userData = JSON.parse(userDataStr);
            if (!userData?.id) throw new Error("Current user's id not found");

            const apiClient = new ApiClient();
            const twoDaysAgo = getTwoDaysUtcLowerBound();
            console.log('[SyncHistory] fetching from API, userId:', userData.id, 'since:', twoDaysAgo);
            let offset = 0, total = 0;
            const raw: any[] = [];
            do {
                const response = await apiClient.syncInfo.fetchDeltaChanges(twoDaysAgo, userData.id, offset);
                const chunk = response?.sync_histories || [];
                total = response?.total || 0;
                console.log('[SyncHistory] API chunk:', chunk.length, 'total:', total);
                raw.push(...chunk);
                offset += chunk.length;
                if (chunk.length === 0) break;
            } while (offset < total);

            const list = raw.map((item: any, index: number) => {
                const data: any = { ...item };
                data.key = `${item.id || item.local_id || index}-${item.synced_at || index}`;
                data.trees = typeof item.trees === 'string' ? JSON.parse(item.trees) : (item.trees || syncDetailsTemplate.trees);
                data.tree_images = typeof item.tree_images === 'string' ? JSON.parse(item.tree_images) : (item.tree_images || syncDetailsTemplate.tree_images);
                return data;
            }).sort((a, b) => new Date(b.synced_at).getTime() - new Date(a.synced_at).getTime());

            console.log('[SyncHistory] final list length:', list.length);
            setSyncInfoList(list);
        } catch (err) {
            console.log('[SyncHistory] API failed, falling back to local DB:', err);
            const daoClient = await DaoClient.authenticate();
            const raw = await daoClient.syncInfo.getSyncInfo();
            console.log('[SyncHistory] local DB rows:', raw.length);
            const list = raw.map(item => {
                const data: any = { ...item };
                data.key = item.local_id;
                data.trees = JSON.parse(item.trees);
                data.tree_images = JSON.parse(item.tree_images);
                return data;
            });
            setSyncInfoList(list);
        }
    };

    useFocusEffect(useCallback(() => { getSyncInfo(); return () => {}; }, []));

    const uploadData = async (netSpeedInKBps: number) => {
        setNetworkSpeed(netSpeedInKBps.toFixed(0));
        const localChangesCount = {
            users: { add: 0, edit: 0, delete: 0 },
            trees: { add: treeChanges?.add || 0, edit: treeChanges?.edit || 0, delete: treeChanges?.delete || 0 },
            tree_images: { add: treeImagesCount?.add || 0, delete: treeImagesCount?.delete || 0 },
            visit_images: { add: 0, delete: 0 },
        };
        const syncedAt = new Date().toISOString();

        setSyncProgress(0);
        setCurrentSyncTime(syncedAt);
        setUploadInProgress(true);
        setCurrentSyncDetails(prev => ({ ...prev, synced_at: syncedAt }));
        await saveSyncInfo({ ...syncDetailsTemplate, synced_at: syncedAt });

        const timeNow = new Date().getTime();
        try {
            await uploadLocalData(localChangesCount, syncedAt);
        } catch (error: any) {
            await Utils.logException(JSON.stringify({ msg: 'upload error', error: JSON.stringify(error), stackTrace: error.stack }));
        }

        const daoClient = await DaoClient.authenticate();
        const syncInfo = await daoClient.syncInfo.getSyncInfoBySyncTime(syncedAt);
        syncInfo.upload_time = new Date().getTime() - timeNow;
        await daoClient.syncInfo.createSyncInfo(syncInfo);
        getSyncInfo();

        setUploadInProgress(false);
        setCurrentSyncTime(null);
        setStoppingSync(false);
        Utils.setLastSyncDateNow();
        Utils.removeNetworkSpeed();
    };

    const stopUploadData = async () => {
        setStoppingSync(true);
        await AsyncStorage.setItem(Constants.isForceSyncStop, 'true');
    };

    const fetchData = async () => {
        if (!selectedSite) {
            ToastAndroid.show('Please select a site first!', ToastAndroid.SHORT);
            return;
        }
        console.log('[Sync] Download started, selectedSite:', JSON.stringify(selectedSite));
        setSyncProgress(0);
        setDownloadInProgress(true);
        try {
            await fetchDeltaChanges(setSyncProgress);
        } catch (error: any) {
            await Utils.logException(JSON.stringify({ msg: 'fetch error', error: JSON.stringify(error), stackTrace: error.stack }));
        }
        setDownloadInProgress(false);
    };

    const saveSyncInfo = async (info: any) => {
        const data = JSON.parse(JSON.stringify(info));
        data.trees = JSON.stringify(data.trees);
        data.tree_images = JSON.stringify(data.tree_images);
        data.visit_images = JSON.stringify(data.visit_images);
        data.users = JSON.stringify(data.users);
        const daoClient = await DaoClient.authenticate();
        await daoClient.syncInfo.createSyncInfo(data);
    };

    const setPendingUploadCounts = async () => {
        const daoClient = await DaoClient.authenticate();
        setTreeChanges(await daoClient.trees.countTreesByChangeTye());
        setTreeImagesCount(await daoClient.treeSnapshots.countTreeSnapshotImages(false));
    };

    const getRemainingUploadTime = () => {
        let items = (treeChanges?.add || 0) + (treeChanges?.edit || 0)
            + (treeImagesCount?.add || 0);
        if (items === 0) return 'few seconds';
        return formatDuration((items * 1024 * 1000) / parseInt(networkSpeed));
    };

    const getNetworkSpeed = () => {
        const n = parseInt(networkSpeed);
        return n >= 1024 ? (n / 1024).toFixed(2) + ' MBps' : networkSpeed + ' KBps';
    };

    const treePending = (treeChanges?.add || 0) + (treeChanges?.edit || 0) + (treeChanges?.delete || 0);
    const imagePending = (treeImagesCount?.add || 0) + (treeImagesCount?.delete || 0);

    return (
        <View style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
            <InternetBanner />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Last sync row */}
                <View style={styles.lastSyncRow}>
                    <Icon source='clock-check-outline' size={16} color='#555' />
                    <Text style={styles.lastSyncLabel}>Last synced:</Text>
                    <Text style={styles.lastSyncValue}>
                        {lastSyncDate === '' ? 'Never' : getTimeDiffString(lastSyncDate)}
                    </Text>
                </View>

                {/* Action buttons */}
                <View style={styles.actionRow}>
                    <Button
                        mode='contained'
                        icon='download-outline'
                        loading={downloadInProgress}
                        buttonColor='#1b5e20'
                        style={styles.actionBtn}
                        labelStyle={styles.actionBtnLabel}
                        disabled={downloadInProgress || uploadInProgress}
                        onPress={fetchData}
                    >{Strings.buttonLabels.DownloadSitesPlots}</Button>

                    <Button
                        mode='contained'
                        icon={uploadInProgress ? 'stop-circle-outline' : 'upload-outline'}
                        loading={uploadInProgress}
                        buttonColor={uploadInProgress ? '#b71c1c' : imagePending > 0 ? '#e65100' : '#2e7d32'}
                        style={styles.actionBtn}
                        labelStyle={styles.actionBtnLabel}
                        disabled={(!uploadInProgress && syncDisabled) || downloadInProgress}
                        onPress={uploadInProgress ? stopUploadData : () => setInternetSpeedCheck(true)}
                    >{uploadInProgress ? Strings.buttonLabels.StopUpload : Strings.buttonLabels.UploadData}</Button>
                </View>

                {/* Progress bar */}
                {(uploadInProgress || downloadInProgress) && (
                    <View style={styles.progressBox}>
                        <Text style={styles.progressLabel}>
                            {uploadInProgress
                                ? `Uploading…${networkSpeed ? '  ' + getRemainingUploadTime() + ' remaining  (' + getNetworkSpeed() + ')' : ''}`
                                : 'Downloading…'}
                        </Text>
                        <ProgressBar
                            progress={syncProgress}
                            style={styles.progressBar}
                            fillStyle={{ backgroundColor: '#2e7d32' }}
                        />
                        <Text style={styles.progressPct}>{getReadableProgress(syncProgress)}</Text>
                    </View>
                )}

                {/* Pending changes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pending Upload</Text>
                    <View style={styles.pendingRow}>
                        <PendingCard
                            icon='tree-outline'
                            label='Trees'
                            value={treePending}
                            sub={treeChanges
                                ? `${treeChanges.add || 0} new · ${treeChanges.edit || 0} edited · ${treeChanges.delete || 0} deleted`
                                : ''}
                        />
                        <PendingCard
                            icon='image-edit-outline'
                            label='Tree Audits'
                            value={imagePending}
                            sub={treeImagesCount
                                ? `${treeImagesCount.add || 0} new · ${treeImagesCount.delete || 0} deleted`
                                : ''}
                        />
                    </View>

                    {/* Recent sync summary */}
                    {(dailySyncSummary.treeDaily.length > 0 || dailySyncSummary.treeImagesDaily.length > 0) && (
                        <View style={styles.recentBox}>
                            {dailySyncSummary.treeDaily.map((e, i) => (
                                <Text key={i} style={styles.recentText}>
                                    ✓ {e.count} trees synced on {e.dateStr}
                                </Text>
                            ))}
                            {dailySyncSummary.treeImagesDaily.map((e, i) => (
                                <Text key={i} style={styles.recentText}>
                                    ✓ {e.count} audits synced on {e.dateStr}
                                </Text>
                            ))}
                        </View>
                    )}
                </View>

                {/* Sync history */}
                {!(uploadInProgress || downloadInProgress) && syncInfoList.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sync History</Text>
                        {syncInfoList.map(info => (
                            <View key={info.key} style={{ marginBottom: 8 }}>
                                <SyncCard
                                    syncedAt={info.synced_at === '' ? '' : getHumanReadableDateTime(info.synced_at)}
                                    trees={info.trees}
                                    treeImages={info.tree_images}
                                    uploadTime={info.upload_time}
                                    fetchError={info.fetch_error || null}
                                    uploadError={info.upload_error || null}
                                />
                            </View>
                        ))}
                    </View>
                )}

                {/* Current sync in progress */}
                {uploadInProgress && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Current Sync</Text>
                        <SyncCard
                            syncedAt={currentSyncDetails.synced_at === '' ? '' : getHumanReadableDateTime(currentSyncDetails.synced_at)}
                            trees={currentSyncDetails.trees}
                            treeImages={currentSyncDetails.tree_images}
                            uploadTime={currentSyncDetails.upload_time}
                            fetchError={currentSyncDetails.fetch_error || null}
                            uploadError={currentSyncDetails.upload_error || null}
                        />
                    </View>
                )}

            </ScrollView>

            <NetworkSpeedModal
                dataSize={(treeChanges?.add || 0) * 1024 * 1024 * 8}
                visible={internetSpeedCheck}
                onClose={() => setInternetSpeedCheck(false)}
                onSubmit={uploadData}
            />
            <MessageModal visible={stoppingSync} text="Stopping the sync. Please wait…" />
        </View>
    );
};

const PendingCard: React.FC<{ icon: string; label: string; value: number; sub: string }> = ({ icon, label, value, sub }) => (
    <View style={pendingStyles.card}>
        <Icon source={icon} size={22} color={value > 0 ? '#e65100' : '#2e7d32'} />
        <Text style={[pendingStyles.value, { color: value > 0 ? '#e65100' : '#2e7d32' }]}>{value}</Text>
        <Text style={pendingStyles.label}>{label}</Text>
        {sub ? <Text style={pendingStyles.sub}>{sub}</Text> : null}
    </View>
);

const pendingStyles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        marginHorizontal: 4,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    value: {
        fontSize: 28,
        fontWeight: '800',
        marginTop: 4,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginTop: 2,
    },
    sub: {
        fontSize: 11,
        color: '#888',
        textAlign: 'center',
        marginTop: 4,
    },
});

const styles = StyleSheet.create({
    scroll: {
        padding: 16,
        paddingBottom: 32,
    },
    lastSyncRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 4,
    },
    lastSyncLabel: {
        fontSize: 13,
        color: '#555',
        marginLeft: 2,
    },
    lastSyncValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1a1a1a',
        marginLeft: 4,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    actionBtn: {
        flex: 1,
        borderRadius: 10,
    },
    actionBtnLabel: {
        fontSize: 13,
        fontWeight: '700',
    },
    progressBox: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    progressLabel: {
        fontSize: 13,
        color: '#555',
        marginBottom: 8,
        textAlign: 'center',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
    },
    progressPct: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
        marginTop: 4,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 10,
    },
    pendingRow: {
        flexDirection: 'row',
        marginHorizontal: -4,
    },
    recentBox: {
        marginTop: 10,
        backgroundColor: '#e8f5e9',
        borderRadius: 8,
        padding: 10,
        gap: 4,
    },
    recentText: {
        fontSize: 12,
        color: '#2e7d32',
        fontWeight: '500',
    },
});

export default Sync;
