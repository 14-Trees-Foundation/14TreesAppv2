import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tree } from '../../model/tree';
import { Button, Icon } from 'react-native-paper';

interface TreeCardInputProps {
  tree: Tree
  plantTypeName: string
  plotName: string
  onEdit: () => void
  onAudit: () => void
  onSync: () => void
  currentTreeSync?: boolean
}

const statusColor: Record<string, string> = {
  healthy: '#2e7d32',
  diseased: '#e65100',
  dead: '#424242',
  lost: '#6a1a1a',
};

const statusBg: Record<string, string> = {
  healthy: '#e8f5e9',
  diseased: '#fff3e0',
  dead: '#f5f5f5',
  lost: '#fce4ec',
};

const TreeCard: React.FC<TreeCardInputProps> = ({
  tree, plantTypeName, plotName, currentTreeSync, onEdit, onAudit, onSync,
}) => {
  const synced = tree.is_uploaded === 1;
  const status = tree.tree_status ?? 'healthy';

  return (
    <View style={[styles.container, synced ? styles.synced : styles.pending]}>
      <View style={styles.body}>
        <View style={[styles.accent, { backgroundColor: synced ? '#2e7d32' : '#f59e0b' }]} />
        <View style={styles.info}>
          <Text style={styles.saplingId}>{tree.sapling_id}</Text>
          {plantTypeName ? <Text style={styles.meta}>{plantTypeName}</Text> : null}
          {plotName ? <Text style={styles.meta} numberOfLines={1}>{plotName}</Text> : null}
        </View>
        <View style={styles.right}>
          <View style={[styles.statusBadge, { backgroundColor: statusBg[status] ?? '#e8f5e9' }]}>
            <Text style={[styles.statusText, { color: statusColor[status] ?? '#2e7d32' }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
          {!synced && (
            <View style={styles.pendingBadge}>
              <Icon source='cloud-upload-outline' size={12} color='#92400e' />
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.actions}>
        <Button
          mode='contained-tonal'
          icon='circle-edit-outline'
          style={styles.action}
          labelStyle={styles.actionLabel}
          contentStyle={styles.actionContent}
          onPress={onEdit}
        >Edit</Button>
        <Button
          mode='contained-tonal'
          icon='image-edit-outline'
          style={[styles.action, styles.auditAction]}
          labelStyle={styles.actionLabel}
          contentStyle={styles.actionContent}
          onPress={onAudit}
        >Audit</Button>
        {!synced && (
          <Button
            mode='contained-tonal'
            icon='cloud-sync-outline'
            loading={currentTreeSync}
            style={[styles.action, styles.syncAction]}
            labelStyle={styles.actionLabel}
            contentStyle={styles.actionContent}
            onPress={onSync}
          >Sync</Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  synced: {
    backgroundColor: '#fff',
  },
  pending: {
    backgroundColor: '#fffbf0',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 12,
  },
  accent: {
    width: 5,
    alignSelf: 'stretch',
    borderRadius: 4,
    marginRight: 12,
    marginLeft: 8,
  },
  info: {
    flex: 1,
  },
  saplingId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  meta: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  pendingText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 14,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  action: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#e8f5e9',
  },
  auditAction: {
    backgroundColor: '#e3f2fd',
  },
  syncAction: {
    backgroundColor: '#fff8e1',
  },
  actionContent: {
    height: 36,
  },
  actionLabel: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '600',
  },
});

export default TreeCard;
