// TreeCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tree } from '../../model/tree';
import { Button } from 'react-native-paper';


interface TreeCardInputProps {
  tree: Tree
  plantTypeName: string
  plotName: string
  onEdit: () => void
  onAudit: () => void
  onTreeMap: () => void
  onSync: () => void
  currentTreeSync?: boolean
}

const TreeCard: React.FC<TreeCardInputProps> = ({ tree, plantTypeName, plotName, currentTreeSync, onEdit, onAudit, onTreeMap, onSync }) => {
  return (
    <View style={[styles.container, { backgroundColor: tree.is_uploaded ? '#dff0d8' : '#ffe7b3' }]}>
      <View style={styles.info}>
        <Text style={styles.title}>{tree.sapling_id}</Text>
        <Text style={styles.text}>{plantTypeName}</Text>
        <Text style={styles.text}>{plotName}</Text>
      </View>
      <View style={styles.actionContainer}>
        <Button
          style={styles.action} 
          labelStyle={styles.actionLabel}
          onPress={onEdit}
          icon='circle-edit-outline'
        >Edit</Button>
        <Button 
          style={styles.action}
          labelStyle={styles.actionLabel}
          onPress={onAudit}
          icon='image-edit'
        >Audit</Button>
        <Button 
          style={styles.action}
          labelStyle={styles.actionLabel}
          onPress={onTreeMap}
          icon='map-marker-radius'
        >Map View</Button>
        {tree.is_uploaded === 0 && <Button 
          loading={currentTreeSync}
          style={styles.action}
          labelStyle={styles.actionLabel}
          onPress={onSync}
          icon='cloud-sync-outline'
        >Sync</Button>}
      </View>
    </View >
  );;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#dff0d8', // Light green color
    width: '100%',
    padding: 5,
    margin: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  info: {
    marginHorizontal: 16,
    flexGrow: 1,
    alignSelf: 'flex-start'
  },
  actionContainer: {
    marginHorizontal: 16,
    flexDirection: 'row',
  },
  action: {
    flexGrow: 1,
  },
  actionLabel: {
    color: 'green'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black'
  },
  text: {
    fontSize: 14,
    color: 'black',
  },
});

export default TreeCard;