// TreeCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tree } from '../../model/tree';



interface TreeCardInputProps {
  tree: Tree
}

const TreeCard: React.FC<TreeCardInputProps> = ({ tree }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.sapling_id}>{tree.sapling_id}</Text>
      <Text style={styles.tree_type}>{tree.tree_type}</Text>
      <Text style={styles.image}>{tree.image}</Text>
      <Text style={styles.tree_location}>{tree.tree_type}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#dff0d8', // Light green color
    width: '100%',
    padding: 10,
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sapling_id: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tree_type: {
    fontSize: 16,
    color: '#555',
  },
  tree_location: {
    fontSize: 16,
    color: '#555',
  },
});

export default TreeCard;
