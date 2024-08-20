import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { TextInput, Button, List, Icon, IconButton } from 'react-native-paper';
import { FlatList, TouchableOpacity } from 'react-native';
import SearchBar from './Searchbar';


interface AutocompleteInputProps<T> {
  label: string
  value: T | null,
  options: T[],
  keyGetter: (option: T) => any
  valueGetter: (option: T) => string
  onSelect: (option: T | null) => void
  onSearch?: (text: string) => void
  variant?: 'flat' | 'outlined'
  disabled?: boolean
  boldSelection?: boolean
}

function Autocomplete<T>({ label, value, options, keyGetter, valueGetter, onSelect, onSearch, variant, disabled, boldSelection }: AutocompleteInputProps<T>) {
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
    setFilteredData(options);
  }

  return (
    <View>
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); disabled || setVisible(true); }}>
        <View pointerEvents='box-only'>
            <TextInput      
              value={value ? valueGetter(value): ''}
              mode= {variant ? variant : 'flat'}
              label={label}
              disabled={disabled}
              style={{ fontWeight: (boldSelection && value) ? 'bold' : 'normal' }}
              numberOfLines={2}
              multiline={value ? valueGetter(value).length > 50 : false}
            />
        </View>
      </TouchableWithoutFeedback>

      {value && (
            <IconButton 
              icon="close" 
              size={20} 
              onPress={() => handleSelect(null)} 
              style={styles.iconButton} 
            />
          )}

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
              keyboardShouldPersistTaps={'handled'}
              style={{ maxHeight: '70%', marginTop: 20 }}
              data={filteredData}
              keyExtractor={(item, index) => keyGetter(item)}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => {
                  handleSelect(item);
                }}>
                  <List.Item
                    title={valueGetter(item)}
                    titleNumberOfLines={2}
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
  container: {
    position: 'relative',
  },
  iconButton: {
    position: 'absolute',
    right: 0,
    top: 8,  // Adjust this value as needed to align with the TextInput
  },
});

export default Autocomplete;
