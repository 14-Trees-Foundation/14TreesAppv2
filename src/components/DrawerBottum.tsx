import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { FAB, IconButton } from 'react-native-paper';



const BottomDrawerComponent: React.FC<{}> = () => {
  const [showFABs, setShowFABs] = useState(false);

  const handleSettingsPress = () => {
    setShowFABs(!showFABs);
  };

  return (
      <View style={styles.container}>
        {showFABs && (
          <View style={styles.fabContainer}>
            <FAB
              style={styles.fab}
              icon="theme-light-dark"
              onPress={() => {console.log('Theme change')}}
              color="white"
            />
            <FAB
              style={styles.fab}
              icon="translate"
              onPress={() => {console.log('Language change')}}
              color="white"
            />
          </View>
        )}
        <View style={styles.buttonContainer}>
          <IconButton
            icon="cog-outline"
            size={24}
            onPress={handleSettingsPress}
          />
          <IconButton
            icon="logout"
            size={24}
            onPress={() => {console.log('Logout!')}}
          />
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
  },
  fabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  fab: {
    marginHorizontal: 8,
    backgroundColor: '#4CAF50', // Change to your preferred color
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default BottomDrawerComponent;
