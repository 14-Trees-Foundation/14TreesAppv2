// VisitCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Visit } from '../../model/visits';

interface VisitCardInputProps {
    visit: Visit
}

const VisitCard: React.FC<VisitCardInputProps> = ({ visit }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{visit.visit_name}</Text>
      <Text style={styles.text}>{visit.visit_type}</Text>
      <Text style={styles.text}>{visit.visit_date}</Text>
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
    color: 'black',
  },
  text: {
    fontSize: 16,
    color: 'black',
  },
});

export default VisitCard;
