import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Chip } from 'react-native-paper';

type SaplingChipListProps = {
  items: string[];
  selectedItems?: string[]
  onSelectionChange?: (selectedItems: string[]) => void;
};

const SaplingChipList: React.FC<SaplingChipListProps> = ({ items, selectedItems, onSelectionChange }) => {
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  useEffect(() => {
    if (selectedItems) setSelectedChips(selectedItems);
  }, [selectedItems])

  const handleChipPress = (item: string) => {
    let newSelectedItems = [...selectedChips];
    if (newSelectedItems.includes(item)) {
      newSelectedItems = newSelectedItems.filter(chip => chip !== item);
    } else {
      newSelectedItems.push(item);
    }
    setSelectedChips(newSelectedItems);
    onSelectionChange && onSelectionChange(newSelectedItems);
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        {items.sort((a, b) => {
          if (a > b) return 1;
          if (a < b) return -1;
          return 0;
        }).map((item, index) => (
          <Chip
            key={index}
            style={{ margin: 4, backgroundColor: selectedChips.includes(item) ? '#82b398' : '#daf7dc', borderColor: 'black', borderWidth: 0.7 }}
            onPress={onSelectionChange ? () => handleChipPress(item) : undefined}
          >
            {item}
          </Chip>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: 10,
    justifyContent: 'center'
  },
  chip: {
    margin: 4,
  },
});

export default SaplingChipList;
