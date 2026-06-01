import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Plot } from '../../model/plot';
import { Button } from 'react-native-paper';
import { Strings } from '../../services/Strings';

interface PlotsCardInputProps {
  plot: Plot
  onAuditPress: () => void
  onAddTreesPress: () => void
}

const PlotsCard: React.FC<PlotsCardInputProps> = ({ plot, onAuditPress, onAddTreesPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={styles.accent} />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{plot.name}</Text>
          {plot.display_name ? (
            <Text style={styles.subtitle} numberOfLines={1}>{plot.display_name}</Text>
          ) : null}
          {plot.category ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{plot.category}</Text>
            </View>
          ) : null}
        </View>
        {plot.total_trees_count != null ? (
          <View style={styles.countBox}>
            <Text style={styles.countValue}>{plot.total_trees_count}</Text>
            <Text style={styles.countLabel}>Trees</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.divider} />
      <View style={styles.actions}>
        <Button
          mode='contained-tonal'
          icon='plus-circle-outline'
          style={styles.action}
          labelStyle={styles.actionLabel}
          contentStyle={styles.actionContent}
          onPress={onAddTreesPress}
        >{Strings.buttonLabels.AddTrees}</Button>
        <Button
          mode='contained-tonal'
          icon='image-edit-outline'
          style={[styles.action, styles.auditAction]}
          labelStyle={styles.actionLabel}
          contentStyle={styles.actionContent}
          onPress={onAuditPress}
        >{Strings.buttonLabels.Audit}</Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    width: '100%',
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingRight: 14,
  },
  accent: {
    width: 5,
    alignSelf: 'stretch',
    backgroundColor: '#2e7d32',
    borderRadius: 4,
    marginRight: 12,
    marginLeft: 8,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 6,
  },
  badgeText: {
    fontSize: 11,
    color: '#2e7d32',
    fontWeight: '600',
  },
  countBox: {
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
  },
  countValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2e7d32',
  },
  countLabel: {
    fontSize: 11,
    color: '#555',
    marginTop: 1,
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
  actionContent: {
    height: 36,
  },
  actionLabel: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '600',
  },
});

export default PlotsCard;
