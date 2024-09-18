import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Plot } from '../../model/plot';
import { Button } from 'react-native-paper';
import { Strings } from '../../services/Strings';

interface PlotsCardInputProps {
  plot: Plot
  onPlotChangePress: () => void
  onAuditPress: () => void
  onTreesMapPress: () => void
  onAddTreesPress: () => void
}

const PlotsCard: React.FC<PlotsCardInputProps> = ({ plot, onPlotChangePress, onAuditPress, onTreesMapPress, onAddTreesPress }) => {
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
          onPress={onAddTreesPress}
        >{Strings.buttonLabels.AddTrees}</Button>
        <Button
          style={styles.action}
          labelStyle={styles.actionLabel}
          onPress={onPlotChangePress}
          icon='map-marker-distance'
        >{Strings.buttonLabels.MoveTrees}</Button>
      </View>
      <View style={styles.actionContainer}>
        <Button
          style={styles.action}
          labelStyle={styles.actionLabel}
          onPress={onAuditPress}
          icon='image-edit'
        >{Strings.buttonLabels.Audit}</Button>
        <Button
          style={styles.action}
          labelStyle={styles.actionLabel}
          onPress={onTreesMapPress}
          icon='map-marker-radius'
        >{Strings.buttonLabels.TreeMap}</Button>
      </View>
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#dff0d8',
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
    width: '100%',
    marginHorizontal: 16,
  },
  actionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 16,
  },
  action: {
    marginHorizontal: 4,
    flex: 1,
  },
  actionLabel: {
    color: 'green',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  text: {
    fontSize: 14,
    color: 'black',
  },
});

export default PlotsCard;
