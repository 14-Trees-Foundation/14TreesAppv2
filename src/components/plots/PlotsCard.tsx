// PlotsCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Plot } from '../../model/plot';

interface PlotsCardInputProps {
    plot: Plot
}

const PlotsCard: React.FC<PlotsCardInputProps> = ({ plot }) => {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.title}>{plot.name}</Text>
        <Text style={styles.text}>{plot.plot_id}</Text>
        <Text style={styles.text}>{plot.category}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
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
    marginLeft: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 14,
    color: 'gray',
  },
});

export default PlotsCard;
