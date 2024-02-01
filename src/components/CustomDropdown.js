import { View, Text, TouchableOpacity, FlatList, TextInput, Keyboard } from 'react-native'
import { useState, useEffect } from 'react';
import { commonStyles } from '../services/Styles';

export const CustomDropdown = ({ items, onSelectItem, initItem, scrollEnabled, label }) => {
    const [filteredOptions, setFilteredOptions] = useState(items);
    const [selectedItem, setSelectedItem] = useState({ value: -1, name: "" });
    useEffect(() => {
        if (initItem === undefined) {
            setSelectedItem({ name: '', value: -1 });
        }
        else {
            setSelectedItem(initItem);
        }
    }, [initItem])
    if (scrollEnabled === undefined) {
        scrollEnabled = false;
    }
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
    }
    const renderOption = ({ item, index }) => {
        return (<TouchableOpacity
            style={commonStyles.defaultButtonStyle}
            onPress={(e) => {
                selectItem(item);
            }}
        >
            <Text style={{ ...commonStyles.text3, color: 'white' }}>{item.name}</Text>
        </TouchableOpacity>);
    }
    return (<View style={{ flexDirection: 'column' }}>
        <TextInput
            style={{ ...commonStyles.txtInput }}
            defaultValue={selectedItem ? (selectedItem.value === -1 ? '' : selectedItem.name) : ''}
            placeholder={label}
            placeholderTextColor={'black'}
            onChangeText={updateFilteredOptions}
            onFocus={(e) => { setOptionsVisible(true); }}
            onBlur={(e) => { }}
        />
        {optionsVisible && <FlatList
            data={filteredOptions}
            renderItem={renderOption}
            scrollEnabled={scrollEnabled}
        />}
    </View>);
}