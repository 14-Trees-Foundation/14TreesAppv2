// PlotsCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Plot } from '../../model/plot';
import { Button } from 'react-native-paper';

interface PlotsCardInputProps {
  plot: Plot
  onPlotChangePress: () => void
  onAuditPress: () => void
  onTreesMapPress: () => void
}

const PlotsCard: React.FC<PlotsCardInputProps> = ({ plot, onPlotChangePress, onAuditPress, onTreesMapPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.title}>{plot.name}</Text>
        <Text style={styles.text}>{plot.plot_id}</Text>
        <Text style={styles.text}>{plot.category}</Text>
      </View>
      <View style={styles.actionContainer}>
        <Button 
          style={styles.action} 
          labelStyle={styles.actionLabel}
          onPress={onPlotChangePress}
          icon='map-marker-distance'
        >Change Plot</Button>
        <Button 
          style={styles.action}
          labelStyle={styles.actionLabel}
          onPress={onAuditPress}
          icon='image-edit'
        >Audit</Button>
        <Button 
          style={styles.action}
          labelStyle={styles.actionLabel}
          onPress={onTreesMapPress}
          icon='map-marker-radius'
        >Tree Map</Button>
      </View>
    </View >
  );
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

export default PlotsCard;
