import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { formatDuration } from '../services/Utils';
import { Strings } from '../services/Strings';

type SyncProgressCardProps = {
    syncedAt: string;
    trees: { add: number; edit: number; delete: number };
    users: { add: number; edit: number; delete: number };
    treeImages: { add: number; delete: number };
    visitImages: { add: number; delete: number };
    visitorData?: { user_tree_image: number; user_card_image: number };
    uploadTime: number
    fetchTime: number
    fetchError: string | null
    uploadError: string | null
};

const SyncProgressCard: React.FC<SyncProgressCardProps> = ({ syncedAt, trees, users, treeImages, visitImages, visitorData, uploadTime, fetchTime, uploadError, fetchError }) => {

    let treesData: string = ''
    if (trees.add !== 0) treesData = `${Strings.messages.New}: ${trees.add}`
    if (trees.edit !== 0) {
        treesData.length === 0
        ? treesData = `${Strings.messages.Updated}: ${trees.edit}`
        : treesData += `, ${Strings.messages.Updated}: ${trees.edit}`
    }
    if (trees.delete !== 0) {
        treesData.length === 0
        ? treesData = `${Strings.messages.Deleted}: ${trees.delete}`
        : treesData += `, ${Strings.messages.Deleted}: ${trees.delete}`
    }

    let usersData: string = ''
    if (users.add !== 0) usersData = `${Strings.messages.New}: ${users.add}`
    if (users.edit !== 0) {
        usersData.length === 0
        ? usersData = `${Strings.messages.Updated}: ${users.edit}`
        : usersData += `, ${Strings.messages.Updated}: ${users.edit}`
    }
    if (users.delete !== 0) {
        usersData.length === 0
        ? usersData = `${Strings.messages.Deleted}: ${users.delete}`
        : usersData += `, ${Strings.messages.Deleted}: ${users.delete}`
    }

    let treeImagesData = ''
    if (treeImages.add !== 0) treeImagesData = `${Strings.messages.New}: ${treeImages.add}`
    if (treeImages.delete !== 0) {
        treeImagesData.length === 0
        ? treeImagesData = `${Strings.messages.Deleted}: ${treeImages.delete}`
        : treeImagesData += `, ${Strings.messages.Deleted}: ${treeImages.delete}`
    }

    let visitImagesData = ''
    if (visitImages.add !== 0) visitImagesData = `${Strings.messages.New}: ${visitImages.add}`
    if (visitImages.delete !== 0) {
        visitImagesData.length === 0
        ? visitImagesData = `${Strings.messages.Deleted}: ${visitImages.delete}`
        : visitImagesData += `, ${Strings.messages.Deleted}: ${visitImages.delete}`
    }

    const visitorDataStr = visitorData && (visitorData.user_tree_image || visitorData.user_card_image)
        ? `Tree: ${visitorData.user_tree_image || 0}${(visitorData.user_card_image || 0) ? `, Card: ${visitorData.user_card_image}` : ''}`
        : '';

    return (
        <View style={styles.card}>
            {syncedAt !== '' && <Text style={styles.syncedAtTitle}>{Strings.messages.StartTime}: <Text style={styles.syncedAt}>{syncedAt}</Text></Text>}

            {usersData.length !== 0 && <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{Strings.messages.Users}: </Text>
                <Text style={styles.detail}>[ {usersData} ]</Text>
            </View>}

            {treesData.length !== 0 && <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{Strings.messages.Trees}: </Text>
                <Text style={styles.detail}>[ {treesData} ]</Text>
            </View>}

            {treeImagesData.length !==0 && <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{Strings.messages.TreeImages}: </Text>
                <Text style={styles.detail}>[ {treeImagesData} ]</Text>
            </View>}

            {visitImagesData.length !== 0 && <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{Strings.messages.VisitImages}: </Text>
                <Text style={styles.detail}>[ {visitImagesData} ]</Text>
            </View>}

            {visitorDataStr.length !== 0 && <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Visitor Data: </Text>
                <Text style={styles.detail}>[ {visitorDataStr} ]</Text>
            </View>}

            {uploadTime !== 0 && <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{Strings.messages.UploadTime}: </Text>
                <Text style={styles.detail}>{formatDuration(uploadTime)}</Text>
            </View>}

            {fetchTime !== 0 && <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{Strings.messages.FetchTime}: </Text>
                <Text style={styles.detail}>{formatDuration(fetchTime)}</Text>
            </View>}

            {fetchError && <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{Strings.messages.FetchError}: </Text>
                <Text style={styles.detail}>{fetchError}</Text>
            </View>}

            {uploadError && <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{Strings.messages.UploadError}: </Text>
                <Text style={styles.detail}>{uploadError}</Text>
            </View>}

            {syncedAt !== '' && treesData.length === 0 && treeImagesData.length === 0 && visitImagesData.length === 0 && visitorDataStr.length === 0 &&
                <Text style={styles.sectionTitle}>{Strings.messages.NoDataUploaded}</Text>
            }
            {syncedAt === '' && treesData.length === 0 && treeImagesData.length === 0 && visitImagesData.length === 0 && visitorDataStr.length === 0 &&
                <Text style={styles.sectionTitle}>{Strings.messages.UploadingChanges}</Text>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#dff0d8', // Light green color
        width: '100%',
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    syncedAtTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 8,
    },
    syncedAt: {
        fontSize: 16,
        color: 'black',
        marginBottom: 8,
    },
    sectionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'black',
    },
    detail: {
        fontSize: 14,
        color: 'black',
    },
});

export default SyncProgressCard;
