// UserCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tree } from '../../model/tree';

// interface UserCardInputProps {
//     user: User
// }

interface TreeCardInputProps {
  tree: Tree
}

const TreeCard: React.FC<TreeCardInputProps> = ({ user }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>
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

export default UserCard;
