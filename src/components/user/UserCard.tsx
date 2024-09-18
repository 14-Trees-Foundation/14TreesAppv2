// UserCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User } from '../../model/user';
import { Avatar } from 'react-native-paper';

interface UserCardInputProps {
    user: User
}

const UserCard: React.FC<UserCardInputProps> = ({ user }) => {
  return (
    <View style={styles.container}>
      <Avatar.Icon size={50} icon='account' style={{ backgroundColor: '#e0e0e0'}}/>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        {user.phone && user.phone !== '0' && <Text style={styles.userEmail}>{user.phone}</Text>}
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
  userInfo: {
    marginLeft: 16,
    flex: 1,
    flexGrow: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black'
  },
  userEmail: {
    fontSize: 14,
    color: 'black',
  },
});

export default UserCard;
