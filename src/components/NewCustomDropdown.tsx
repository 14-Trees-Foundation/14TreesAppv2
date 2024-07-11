import { View, Text, TouchableOpacity, FlatList, TextInput, Keyboard } from 'react-native'
import { useState, useEffect, useContext } from 'react';
import { commonStyles, customDropdownStyles } from '../services/Styles';
import Icon from 'react-native-vector-icons/Ionicons';
import GlobalContext from '../context/GlobalContext ';

interface CustomDropdownInputProps<T> {
    label: string,
    options: T[],
    value: T,
    onChange: (data: T | null) => void,
    valueGetter: (data: T) => string,
    keyGetter: (data: T) => any,
    onSearch?: (str: string) => void,
};

export function NewCustomDropdown<T>({ label, options, value, onChange, valueGetter, keyGetter, onSearch }: CustomDropdownInputProps<T>) {
    const [filteredOptions, setFilteredOptions] = useState(options);
    const [selectedItem, setSelectedItem] = useState<T | null>(null);
    const [clearButton, setClearButton] = useState(true);
    const [isFocused,setIsFocused] = useState(false)
    const [searchTxt, setSearchTxt] = useState('')

    const { lightTheme } = useContext(GlobalContext);

    useEffect(() => {
        if (value) {
            setSelectedItem(value);
        }

        if (value === null) {
            setClearButton(false);
        }

    }, [value])

    useEffect(() => {
        setFilteredOptions(options);
    }, [options])

    useEffect(() => {
        if (searchTxt.length === 0) setFilteredOptions(options);
        if (onSearch === undefined) setFilteredOptions(options.filter((option) => valueGetter(option).toLowerCase().includes(searchTxt.toLowerCase())));
        else onSearch(searchTxt);
    }, [searchTxt])

    const handleSearch = (text: string) => {
        setSearchTxt(text);
        setSelectedItem(null);
    }
    const [optionsVisible, setOptionsVisible] = useState(false);

    const selectItem = (item: T) => {
        Keyboard.dismiss();
        onChange(item);
        setOptionsVisible(false);
        setSelectedItem(item);
        setSearchTxt('');
        setClearButton(true);
    }

    const renderOption = ({ item, index }) => {
        return (
            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    alignContent: 'center',
                    alignItems: 'center',
                    borderColor: '#B8B8B8',
                    // backgroundColor: 'white',
                    borderWidth: 0.2,
                    //margin: 5,
                    padding: 10,
                }}
                onPress={(e) => {
                    selectItem(item);
                }}

            >
                <Text style={{ ...commonStyles.dropdownOptionsContent }}>{valueGetter(item)}</Text>
            </TouchableOpacity>
        );
    }

    const clearSelection = () => {
        setSelectedItem(null);
        onChange(null);
    };

    return (

        <View style={{ backgroundColor: "white"}}>
            <TextInput
                style={{
                    height: 54,
                    fontFamily: 'Inter-Regular',
                    width: '93%',
                    borderWidth: 2,
                    borderColor: !isFocused?"#ccc":"black",
                    // shadowColor: '#000',
                    // shadowOffset: {
                    //     width: 0,
                    //     height: 2,
                    // },
                    backgroundColor: 'white',
                    padding: 10,
                    marginBottom: 10,
                    paddingBottom: 12,
                    // color: '#333', // Change font color here
                    //fontWeight: 'bold',
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: 'center', fontSize: 15,
                    shadowColor: 'black',
                    shadowOpacity: 0.8,
                    elevation: 3,
                    shadowRadius: 1,
                    shadowOffset: { width: 1, height: 4 },
                    borderRadius: 10,
                    color: lightTheme ? '#333' : 'black',
                    fontWeight: value ? 'bold' : 'normal',
                    
                }}
                value={selectedItem ? valueGetter(selectedItem) : searchTxt}
                placeholder={label}
                placeholderTextColor={'black'}
                onChangeText={handleSearch}
                onFocus={(e) => { setOptionsVisible(true) ;setIsFocused(true)}}
                onBlur={() => {setIsFocused(false)}}
            />

            {clearButton && selectedItem && (
                <TouchableOpacity style={customDropdownStyles.clearButton}
                    onPress={clearSelection}  >
                    <Icon name="close-circle" size={25} color="red" />
                </TouchableOpacity>
            )}

            {optionsVisible && <FlatList
                data={filteredOptions}
                renderItem={renderOption}
                keyboardShouldPersistTaps="handled"
                keyExtractor={(item) => keyGetter(item)}
                scrollEnabled={false}
                style={{ marginLeft: 13, width: "93%", borderColor: "#B8B8B8", borderWidth: 0, borderRadius: 10, backgroundColor: "white" }}
            />
            }
        </View>
    );
}

