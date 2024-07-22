// PlotsCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Plot } from '../../model/plot';

interface PlotsCardInputProps {
    plot: Plot
}

const PlotsCard: React.FC<PlotsCardInputProps> = ({ plot }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{plot.name}</Text>
      <Text style={styles.text}>{plot.plot_id}</Text>
      <Text style={styles.text}>{plot.category}</Text>
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    color: 'black',
  },
 
});

export default PlotsCard;
