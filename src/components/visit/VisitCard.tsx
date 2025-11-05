// VisitCard.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Visit } from '../../model/visits';
import moment from 'moment';
import { Button } from 'react-native-paper';
import { Strings } from '../../services/Strings';
import { DaoClient } from '../../services/db/dao';

interface VisitCardInputProps {
    visit: Visit
    onTreeAdd: () => void
    onEdit: () => void
    onRangeAdd?: () => void
}

const VisitCard: React.FC<VisitCardInputProps> = ({ visit, onTreeAdd, onEdit, onRangeAdd }) => {
  const [visitorDataCount, setVisitorDataCount] = useState<number>(0);
  const [isLoadingCount, setIsLoadingCount] = useState<boolean>(true);

  const getDateStringForVisit = (str: string) => {
    const date = new Date(str);
    if (isNaN(date.getTime())) return '';

    return moment(date).format('DD MMMM, YYYY');
  }

  const fetchVisitorDataCount = async () => {
    try {
      setIsLoadingCount(true);
      const daoClient = await DaoClient.authenticate();

      // Count the visitor images that are not uploaded for trees in this visit
      const totalCount = await daoClient.treeImages.countVisitorImagesForVisit(visit.id, false);

      setVisitorDataCount(totalCount);
    } catch (error) {
      console.error('Error fetching visitor data count:', error);
      setVisitorDataCount(0);
    } finally {
      setIsLoadingCount(false);
    }
  }

  useEffect(() => {
    fetchVisitorDataCount();
  }, [visit]);

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.title}>{visit.visit_name}</Text>
        <Text style={styles.text}>{visit.visit_type}</Text>
        <Text style={styles.text}>{getDateStringForVisit(visit.visit_date)}</Text>
        {!isLoadingCount && visitorDataCount > 0 && (
          <Text style={styles.countText}>
            {visitorDataCount} unsynced visitor data entr{visitorDataCount !== 1 ? 'ies' : 'y'}
          </Text>
        )}
      </View>
      <View style={styles.actionContainer}>
        <Button
          style={styles.action} 
          labelStyle={styles.actionLabel}
          onPress={onTreeAdd}
        >{Strings.buttonLabels.AddVisitorData}</Button>
        {onRangeAdd && (
          <Button
            style={styles.action}
            labelStyle={styles.actionLabel}
            onPress={onRangeAdd}
          >{Strings.buttonLabels.AddVisitorDataRange}</Button>
        )}
        {/* <Button
          style={styles.action} 
          labelStyle={styles.actionLabel}
          onPress={onEdit}
        >{Strings.buttonLabels.AddVisitImages}</Button> */}
      </View>
    </View>
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black'
  },
  text: {
    fontSize: 14,
    color: 'black',
  },
  actionContainer: {
    marginHorizontal: 16,
    flexDirection: 'row',
  },
  action: {
    flexGrow: 1,
  },
  actionLabel: {
    color: 'green'
  },
  countText: {
    fontSize: 12,
    color: '#ff9800', // Orange color for unsynced items
    fontWeight: '500',
    marginTop: 4,
  },
});

export default VisitCard;
