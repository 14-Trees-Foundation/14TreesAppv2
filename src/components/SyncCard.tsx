import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { formatDuration } from '../services/Utils';
import { Strings } from '../services/Strings';

type SyncCardProps = {
    syncedAt: string;
    trees: { add: number; edit: number; delete: number };
    treeImages: { add: number; delete: number };
    uploadTime: number;
    fetchError: string | null;
    uploadError: string | null;
};

const StatChip: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <View style={[chipStyles.chip, { borderColor: color }]}>
        <Text style={[chipStyles.value, { color }]}>{value}</Text>
        <Text style={chipStyles.label}>{label}</Text>
    </View>
);

const chipStyles = StyleSheet.create({
    chip: {
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 6,
        marginBottom: 4,
        minWidth: 52,
    },
    value: {
        fontSize: 16,
        fontWeight: '700',
    },
    label: {
        fontSize: 11,
        color: '#666',
        marginTop: 1,
    },
});

const SyncCard: React.FC<SyncCardProps> = ({ syncedAt, trees, treeImages, uploadTime, uploadError, fetchError }) => {
    const hasTreeData = trees.add + trees.edit + trees.delete > 0;
    const hasImageData = treeImages.add + treeImages.delete > 0;
    const hasAnyData = hasTreeData || hasImageData;
    const hasError = !!fetchError || !!uploadError;

    return (
        <View style={[styles.card, hasError && styles.cardError]}>
            {syncedAt !== '' && (
                <View style={styles.header}>
                    <Icon source='clock-outline' size={14} color='#666' />
                    <Text style={styles.syncedAt}>{syncedAt}</Text>
                    {uploadTime !== 0 && (
                        <Text style={styles.duration}>{formatDuration(uploadTime)}</Text>
                    )}
                </View>
            )}

            {hasAnyData && (
                <View style={styles.section}>
                    {hasTreeData && (
                        <View style={styles.row}>
                            <Text style={styles.sectionTitle}>Trees</Text>
                            <View style={styles.chips}>
                                {trees.add > 0 && <StatChip label='New' value={trees.add} color='#2e7d32' />}
                                {trees.edit > 0 && <StatChip label='Updated' value={trees.edit} color='#1565c0' />}
                                {trees.delete > 0 && <StatChip label='Deleted' value={trees.delete} color='#b71c1c' />}
                            </View>
                        </View>
                    )}
                    {hasImageData && (
                        <View style={styles.row}>
                            <Text style={styles.sectionTitle}>Audits</Text>
                            <View style={styles.chips}>
                                {treeImages.add > 0 && <StatChip label='New' value={treeImages.add} color='#2e7d32' />}
                                {treeImages.delete > 0 && <StatChip label='Deleted' value={treeImages.delete} color='#b71c1c' />}
                            </View>
                        </View>
                    )}
                </View>
            )}

            {!hasAnyData && syncedAt !== '' && (
                <Text style={styles.emptyText}>{Strings.messages.NoDataUploaded}</Text>
            )}
            {!hasAnyData && syncedAt === '' && (
                <Text style={styles.emptyText}>{Strings.messages.UploadingChanges}</Text>
            )}

            {fetchError && (
                <View style={styles.errorRow}>
                    <Icon source='alert-circle-outline' size={14} color='#b71c1c' />
                    <Text style={styles.errorText}>{fetchError}</Text>
                </View>
            )}
            {uploadError && (
                <View style={styles.errorRow}>
                    <Icon source='alert-circle-outline' size={14} color='#b71c1c' />
                    <Text style={styles.errorText}>{uploadError}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        width: '100%',
        padding: 12,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#2e7d32',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    cardError: {
        borderLeftColor: '#b71c1c',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 4,
    },
    syncedAt: {
        fontSize: 13,
        color: '#555',
        flex: 1,
        marginLeft: 2,
    },
    duration: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
    },
    section: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#333',
        width: 52,
        marginRight: 8,
    },
    chips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1,
    },
    emptyText: {
        fontSize: 13,
        color: '#888',
        fontStyle: 'italic',
    },
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 4,
    },
    errorText: {
        fontSize: 12,
        color: '#b71c1c',
        flex: 1,
    },
});

export default SyncCard;
