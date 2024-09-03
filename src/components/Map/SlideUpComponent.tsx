import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Animated,
  TouchableOpacity,
  Text,
} from 'react-native';
import { IconButton } from 'react-native-paper';

interface SlideUpComponentProps {
  items: string[];
  onTreeEdit: (sapling: string) => void,
  onTreeDelete: (sapling: string) => void,
  onTreeSelect: (sapling: string) => void,
  visible: boolean
}

interface RenderItemProps {
  item: string;
  onTreeEdit: () => void,
  onTreeDelete: () => void,
  onTreeSelect: () => void,
}

const SaplingItem: React.FC<RenderItemProps> = ({ item, onTreeDelete, onTreeEdit, onTreeSelect }: RenderItemProps) => {
  return (
    <TouchableOpacity
      style={styles.listItem}
      onPress={onTreeSelect}
    >
      <Text style={styles.itemText}>{item}</Text>
      <View style={styles.iconContainer}>
        <IconButton
          icon="circle-edit-outline"
          size={20}
          iconColor='green'
          onPress={onTreeEdit}
        />
        <IconButton
          icon="delete-outline"
          size={20}
          iconColor='red'
          onPress={onTreeDelete}
        />
      </View>
    </TouchableOpacity>
  );
}

const SlideUpComponent: React.FC<SlideUpComponentProps> = ({ items, visible, onTreeEdit, onTreeDelete, onTreeSelect }) => {
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

  return (
    visible
      ? (
        <Animated.View
          style={[styles.slideUpContainer, { bottom: slideUpAnimation }]}
        >
          <Text style={styles.listTitle}>{items.length !== 0 ? 'Trees in near by area:' : 'There no trees in near by area!'}</Text>
          <FlatList
            data={items}
            renderItem={(item) => (
              <SaplingItem
                item={item.item}
                onTreeEdit={() => onTreeEdit(item.item)}
                onTreeDelete={() => onTreeDelete(item.item)}
                onTreeSelect={() => onTreeSelect(item.item)}
              />
            )}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.listContent}
          />
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
    height: '50%',
    backgroundColor: 'white',
    borderTopEndRadius: 10,
    padding: 20,
    zIndex: 2
  },
  listContent: {
    paddingBottom: 20,
  },
  listTitle: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
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
