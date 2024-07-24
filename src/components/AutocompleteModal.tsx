import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, Keyboard } from 'react-native';
import { TextInput, Button, List, Icon } from 'react-native-paper';
import { FlatList, TouchableOpacity } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import SearchBar from './Searchbar';


interface AutocompleteInputProps<T> {
  label: string
  value: T,
  options: T[],
  keyGetter: (option: T) => any
  valueGetter: (option: T) => string
  onSelect: (option: T | null) => void
  onSearch?: (text: string) => void
  variant?: 'flat' | 'outlined'
}

function Autocomplete<T>({ label, value, options, keyGetter, valueGetter, onSelect, onSearch, variant }: AutocompleteInputProps<T>) {
  const [filteredData, setFilteredData] = useState(options);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setFilteredData(options);
  }, [options])

  const handleSearch = (query: string) => {
    if (onSearch) {
      onSearch(query);
      return;
    }

    if (query) {
      const newData = options.filter(item => {
        const value = valueGetter(item);
        return value.toLowerCase().includes(query.toLowerCase())
      });
      setFilteredData(newData);
    } else {
      setFilteredData(options);
    }
  };

  const handleClose = () => {
    setVisible(false);
  }

  const handleSelect = (option: T | null) => {
    onSelect(option);
    handleClose();
  }

  return (
    <View>
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setVisible(true);}}>
          <View pointerEvents='box-only'>
            <TextInput
              value={value ? valueGetter(value): ''}
              mode= {variant ? variant : 'flat'}
              label={label}
              right={<Icon source='close' size={10}/>}
            />
          </View>
      </TouchableWithoutFeedback>

      <Modal
        visible={visible}
        onRequestClose={handleClose}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <SearchBar onChange={handleSearch}/>
            <FlatList
              style={{ maxHeight: '70%', marginTop: 20 }}
              data={filteredData}
              keyExtractor={(item, index) => keyGetter(item)}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelect(item)}>
                  <List.Item
                    title={valueGetter(item)}
                  />
                </TouchableOpacity>
              )}
            />
            <View style={{
              marginTop: 20,
              flexDirection: 'row',
              justifyContent: 'space-between', // Adjusts spacing between buttons
              alignItems: 'center',
            }}>
              {value && <Button icon='close' mode="contained" onPress={() => handleSelect(null)} style={{...styles.closeButton, backgroundColor: '#FF6666', maxWidth: '60%'}}>
                {valueGetter(value)}
              </Button>}
              <Button mode="contained" onPress={handleClose} style={{...styles.closeButton, backgroundColor: '#4CAF50'}}>
                Close
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    minHeight: '30%',
    maxHeight: '60%',
  },
  closeButton: {
    marginHorizontal: 5,
    flexGrow: 1,
  },
});

export default Autocomplete;
