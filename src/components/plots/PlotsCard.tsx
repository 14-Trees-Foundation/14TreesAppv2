// PlotsCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Plots } from '../../model/plots';

interface PlotsCardInputProps {
    plot: Plots
}

const PlotsCard: React.FC<PlotsCardInputProps> = ({ plot }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{plot.name}</Text>
      <Text style={styles.email}>{plot.plot_id}</Text>
      <Text style={styles.email}>{plot.land_type}</Text>
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
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#555',
  },
});

export default PlotsCard;
