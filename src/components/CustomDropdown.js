import { View, Text, TouchableOpacity, FlatList, TextInput, Keyboard, Pressable, ScrollView } from 'react-native'
import { useState, useEffect, useContext } from 'react';
import { commonStyles } from '../services/Styles';
import Icon from 'react-native-vector-icons/Ionicons';
import GlobalContext from '../context/GlobalContext ';


export const CustomDropdown = ({ items, onSelectItem, initItem, scrollEnabled, label }) => {
    const [filteredOptions, setFilteredOptions] = useState(items);
    const [selectedItem, setSelectedItem] = useState({ value: -1, name: "" });
    const [clearButton, setClearButton] = useState(true);

    const { setPlotSelected, lightTheme } = useContext(GlobalContext);

    useEffect(() => {
        //console.log("item: ---", initItem);
        //console.log("re-rendered custom dropdown");

        if (initItem) {
            setSelectedItem(initItem);
        } else {
            setSelectedItem({ name: '', value: -1 });
        }

        if (initItem === null) {
            setClearButton(false);
        }

    }, [initItem])

    // if (scrollEnabled === undefined) {
    //     scrollEnabled = false;
    // }

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
                style={commonStyles.dropdownOptions}
                onPress={(e) => {
                    selectItem(item);
                }}

            >
                <Text style={{ ...commonStyles.dropdownOptionsContent, color: 'white' }}>{item.name}</Text>
            </TouchableOpacity>
        );
    }

    const clearSelection = () => {
        setSelectedItem({ name: '', value: -1 });
        onSelectItem(null);
    };

    return (

        <View>
            <TextInput
                style={{
                    ...commonStyles.txtInput,
                    color: lightTheme ? '#52525C' : 'black',
                    fontSize: 15, borderRadius: 13,
                    fontWeight: (initItem) ? 'bold' : 'normal'
                }}
                defaultValue={selectedItem ? (selectedItem.value === -1 ? '' : selectedItem.name) : ''}
                placeholder={label}
                placeholderTextColor={'black'}
                onChangeText={updateFilteredOptions}
                onFocus={(e) => { setOptionsVisible(true); }}
            />

            {clearButton && selectedItem && selectedItem.value !== -1 && (
                <TouchableOpacity style={{ position: 'absolute', top: 22, right: 29, zIndex: 1 }}
                    onPress={clearSelection}  >
                    <Icon name="close-circle" size={25} color="red" />
                </TouchableOpacity>
            )}

            {optionsVisible && <FlatList
                data={filteredOptions}
                renderItem={renderOption}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={false}
            />
            }
        </View>


    );
}
