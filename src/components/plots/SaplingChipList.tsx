import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Badge, Chip } from 'react-native-paper';

export type SaplingChipItem = {
  sapling: string,
  badge?: number,
  selected?: boolean
}

type SaplingChipListProps = {
  items: SaplingChipItem[];
  onSelectionChange?: (sapling: string) => void;
};

const SaplingChipList: React.FC<SaplingChipListProps> = ({ items, onSelectionChange }) => {

  return (
    <ScrollView>
      <View style={styles.container}>
        {items.sort((a, b) => {
          if (a.sapling > b.sapling) return 1;
          if (a.sapling < b.sapling) return -1;
          return 0;
        }).map((item, index) => (
          <View key={index}>
            <Chip
              key={index}
              style={{ margin: 4, backgroundColor: item.selected ? '#82b398' : '#daf7dc', borderColor: 'black', borderWidth: 0.7 }}
              onPress={() => {onSelectionChange && onSelectionChange(item.sapling)}}
            >
              {item.sapling}
            </Chip>
            {(item.badge !== undefined && item.badge > 0) && <Badge size={20} style={{ backgroundColor: 'orange', borderRadius: 10, position: 'absolute', top: 2, right: 2 }}>{String(item.badge)}</Badge>}
          </View>
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
