import { View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet, Keyboard, Pressable, ScrollView } from 'react-native'
import { useState, useEffect, useContext } from 'react';
import { commonStyles, customDropdownStyles } from '../services/Styles';
import Icon from 'react-native-vector-icons/Ionicons';
import GlobalContext from '../context/GlobalContext ';

export const CustomDropdown = ({ items, onSelectItem, initItem, scrollEnabled, label }) => {
    const [filteredOptions, setFilteredOptions] = useState(items);
    const [selectedItem, setSelectedItem] = useState({ value: -1, name: "" });
    const [clearButton, setClearButton] = useState(true);

    const {  lightTheme } = useContext(GlobalContext);

    useEffect(() => {
        if (initItem) {
            setSelectedItem(initItem);
        } else {
            setSelectedItem({ name: '', value: -1 });
        }

        if (initItem === null) {
            setClearButton(false);
        }

    }, [initItem])

    const updateFilteredOptions = (text) => {
        if (text.length > 0) {
            setFilteredOptions(items.filter((option) => option.name.toLowerCase().includes(text.toLowerCase())))
        }
        else {
            setFilteredOptions(items);
        }
    }
    const [optionsVisible, setOptionsVisible] = useState(false);

    const selectItem = (item) => {
        Keyboard.dismiss();
        onSelectItem(item);
        setOptionsVisible(false);
        setSelectedItem(item);
        setClearButton(true);
    }

    const renderOption = ({ item, index }) => {
        return (
            <TouchableOpacity
                style={{
                    fontFamily: 'Inter-Regular',
                    flexDirection: 'row',
                    alignContent: 'center',
                    alignItems: 'center',
                    fontSize: 40,
                    borderColor: '#B8B8B8',
                    // backgroundColor: 'white',
                    borderWidth: 0.2,
                    //margin: 5,
                    padding: 10,
                    //borderRadius: 5,
                    // shadowColor: 'black',
                    // elevation: 3,
                    // shadowOffset: {
                    //     width: 50,
                    //     height: 50,
                    // },
                    // shadowOpacity: 1,
                }}
                onPress={(e) => {
                    selectItem(item);
                }}

            >
                <Text style={{ ...commonStyles.dropdownOptionsContent }}>{item.name}</Text>
            </TouchableOpacity>
        );
    }

    const clearSelection = () => {
        setSelectedItem({ name: '', value: -1 });
        onSelectItem(null);
    };

    return (

        <View style={{ backgroundColor: "white" }}>
            <TextInput
                style={{
                    height: 50,
                    fontFamily: 'Inter-Regular',
                    width: '93%',
                    borderWidth: 2,
                    borderColor: "#ccc",
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    backgroundColor: 'white',
                    marginTop: 10,
                    padding: 10,
                    marginBottom: 6,
                    paddingBottom: 12,
                    color: '#52525C', // Change font color here
                    //fontWeight: 'bold',
                    alignItems: 'center',
                    justifyContent: 'center',
                    //fontStyle: "italic", 
                    alignSelf: 'center', fontSize: 15,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    borderRadius: 10,
                    color: lightTheme ? '#52525C' : 'black',
                    fontWeight: initItem ? 'bold' : 'normal',
                }}
                defaultValue={selectedItem ? (selectedItem.value === -1 ? '' : selectedItem.name) : ''}
                placeholder={label}
                placeholderTextColor={'black'}
                onChangeText={updateFilteredOptions}
                onFocus={(e) => { setOptionsVisible(true) }}
            />

            {clearButton && selectedItem && selectedItem.value !== -1 && (
                <TouchableOpacity style={customDropdownStyles.clearButton}
                    onPress={clearSelection}  >
                    <Icon name="close-circle" size={25} color="red" />
                </TouchableOpacity>
            )}

            {optionsVisible && <FlatList
                data={filteredOptions}
                renderItem={renderOption}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={false}
                style={{ marginLeft: 13, width: "93%", borderColor: "#B8B8B8", borderWidth: 0, borderRadius: 10, backgroundColor: "white" }}
            />
            }
        </View>
    );
}

