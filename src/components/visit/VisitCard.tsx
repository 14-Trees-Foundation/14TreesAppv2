// VisitCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Visit } from '../../model/visits';
import moment from 'moment';

interface VisitCardInputProps {
    visit: Visit
}

const VisitCard: React.FC<VisitCardInputProps> = ({ visit }) => {

  const getDateStringForVisit = (str: string) => {
    const date = new Date(str);
    if (isNaN(date.getTime())) return '';

    return moment(date).format('DD MMMM, YYYY');
  }

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.title}>{visit.visit_name}</Text>
        <Text style={styles.text}>{visit.visit_type}</Text>
        <Text style={styles.text}>{getDateStringForVisit(visit.visit_date)}</Text>
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
    color: 'gray'
  },
  text: {
    fontSize: 14,
    color: 'gray',
  },
});

export default VisitCard;
