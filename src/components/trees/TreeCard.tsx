// TreeCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tree } from '../../model/tree';


interface TreeCardInputProps {
  tree: Tree
  plantTypeName: string
  plotName: string
}

const TreeCard: React.FC<TreeCardInputProps> = ({ tree, plantTypeName, plotName }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.header}>{tree.sapling_id}</Text>
      <Text style={styles.sub_fields}>{plantTypeName}</Text>
      <Text style={styles.sub_fields}>{plotName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#dff0d8', // Light green color
    width: '95%',
    padding: 10,
    marginTop: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sub_fields: {
    fontSize: 16,
    color: '#555',
  },
  tree_location: {
    fontSize: 16,
    color: '#555',
  },
});

export default TreeCard;