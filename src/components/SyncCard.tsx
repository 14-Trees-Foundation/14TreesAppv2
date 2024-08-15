import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { formatDuration } from '../services/Utils';

type SyncCardProps = {
    syncedAt: string;
    trees: { add: number; edit: number; delete: number };
    treeImages: { add: number; delete: number };
    visitImages: { add: number; delete: number };
    uploadTime: number
    fetchTime: number
};

const SyncCard: React.FC<SyncCardProps> = ({ syncedAt, trees, treeImages, visitImages, uploadTime, fetchTime }) => {

    let treesData: string = ''
    if (trees.add !== 0) treesData = `New: ${trees.add}`
    if (trees.edit !== 0) {
        treesData.length === 0
        ? treesData = `Update: ${trees.edit}`
        : treesData += `, Update: ${trees.edit}`
    }
    if (trees.delete !== 0) {
        treesData.length === 0
        ? treesData = `Deleted: ${trees.delete}`
        : treesData += `, Deleted: ${trees.delete}`
    }

    let treeImagesData = ''
    if (treeImages.add !== 0) treeImagesData = `New: ${treeImages.add}`
    if (treeImages.delete !== 0) {
        treeImagesData.length === 0
        ? treeImagesData = `Deleted: ${treeImages.delete}`
        : treeImagesData += `, Deleted: ${treeImages.delete}`
    }

    let visitImagesData = ''
    if (visitImages.add !== 0) visitImagesData = `New: ${visitImages.add}`
    if (visitImages.delete !== 0) {
        visitImagesData.length === 0
        ? visitImagesData = `Deleted: ${visitImages.delete}`
        : visitImagesData += `, Deleted: ${visitImages.delete}`
    }

    return (
        <View style={styles.card}>
            {syncedAt !== '' && <Text style={styles.syncedAtTitle}>Synced At: <Text style={styles.syncedAt}>{syncedAt}</Text></Text>}
            {syncedAt === '' && <Text style={styles.syncedAtTitle}>Current sync details:</Text>}

            {treesData.length !== 0 && <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Trees: </Text>
                <Text style={styles.detail}>[ {treesData} ]</Text>
            </View>}

            {treeImagesData.length !==0 && <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Tree Images: </Text>
                <Text style={styles.detail}>[ {treeImagesData} ]</Text>
            </View>}

            {visitImagesData.length !== 0 && <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Visit Images: </Text>
                <Text style={styles.detail}>[ {visitImagesData} ]</Text>
            </View>}

            {uploadTime !== 0 && <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Upload Time: </Text>
                <Text style={styles.detail}>{formatDuration(uploadTime)}</Text>
            </View>}

            {fetchTime !== 0 && <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Fetch Time: </Text>
                <Text style={styles.detail}>{formatDuration(fetchTime)}</Text>
            </View>}

            {syncedAt !== '' && treesData.length === 0 && treeImagesData.length === 0 && visitImagesData.length === 0 &&
                <Text style={styles.sectionTitle}>No data was uploaded in this sync.</Text>
            }
            {syncedAt === '' && treesData.length === 0 && treeImagesData.length === 0 && visitImagesData.length === 0 &&
                <Text style={styles.sectionTitle}>Uploading changes...</Text>
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
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 1,
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

export default SyncCard;
