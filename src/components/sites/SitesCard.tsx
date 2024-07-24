// SitesCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Site } from '../../model/sites';

interface SiteCardInputProps {
    site: Site
}

const SiteCard: React.FC<SiteCardInputProps> = ({ site }) => {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.title}>{site.name_english}</Text>
        <Text style={styles.text}>{site.name_marathi}</Text>
        <Text style={styles.text}>{site.district} {site.taluka} {site.village}</Text>
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

export default SiteCard;
