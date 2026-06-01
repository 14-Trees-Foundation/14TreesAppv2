// UserCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';
import { TreePlantationInfo } from '../../model/tree';

interface PlantationInfoCardInputProps {
    info: TreePlantationInfo
}

const PlantationInfoCard: React.FC<PlantationInfoCardInputProps> = ({ info }) => {
  return (
    <View style={styles.container}>
      <Avatar.Icon size={50} icon='account' style={{ backgroundColor: '#e0e0e0'}}/>
      <View style={styles.info}>
        <Text style={styles.title}>{info.user_name}</Text>
        <Text style={styles.text}>{info.plot_name}</Text>
        <Text style={styles.text}>Trees Planted: {info.trees_planted}</Text>
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
    flex: 1,
    flexGrow: 1,
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

export default PlantationInfoCard;
