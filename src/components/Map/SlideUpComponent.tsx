import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Text,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import SaplingChipList from '../plots/SaplingChipList';

interface SlideUpComponentProps {
  items: string[];
  selectedItem: string | null
  onTreeEdit: () => void,
  onTreeDelete: () => void,
  onTreeSelect: (sapling: string | null) => void,
  onTreeMove: () => void,
  visible: boolean
}

const SlideUpComponent: React.FC<SlideUpComponentProps> = ({ items, selectedItem, visible, onTreeEdit, onTreeDelete, onTreeSelect, onTreeMove }) => {
  const slideUpAnimation = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideUpAnimation, {
        toValue: 0, // Slide down
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(slideUpAnimation, {
        toValue: -300, // Slide up
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [visible])

  const handleItemSelection = (item: string) => {
    if ( selectedItem === item ) {
      onTreeSelect(null);
    } else {
      onTreeSelect(item);
    }
  }

  return (
    visible
      ? (
        <Animated.View
          style={[styles.slideUpContainer, { bottom: slideUpAnimation }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.listTitle}>{items.length !== 0 ? 'Trees in near by area:' : 'No trees in near by area!'}</Text>
            <View style={styles.iconContainer}>
              <IconButton
                icon="map-marker-distance"
                size={20}
                iconColor='green'
                onPress={onTreeMove}
                disabled={selectedItem === null}
              />
              <IconButton
                icon="circle-edit-outline"
                size={20}
                iconColor='green'
                onPress={onTreeEdit}
                disabled={selectedItem === null}
              />
              <IconButton
                icon="delete-outline"
                size={20}
                iconColor='red'
                onPress={onTreeDelete}
                disabled={selectedItem === null}
              />
            </View>
          </View>
          <SaplingChipList items={items.map(sapling => ({ sapling, selected: sapling === selectedItem }))} onSelectionChange={handleItemSelection} />
        </Animated.View>
      )
      : (
        <View></View>
      )
  );
};

const styles = StyleSheet.create({
  slideUpContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'white',
    borderTopEndRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 2
  },
  listContent: {
    paddingBottom: 20,
  },
  listTitle: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    flexGrow: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    flex: 1,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default SlideUpComponent;
