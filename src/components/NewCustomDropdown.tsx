import { View, Text, TouchableOpacity, FlatList, TextInput, Keyboard, Dimensions, Modal } from 'react-native'
import { useState, useEffect, useContext, useRef } from 'react';
import { commonStyles, customDropdownStyles } from '../services/Styles';
import Icon from 'react-native-vector-icons/Ionicons';
import GlobalContext from '../context/GlobalContext ';

const { height: screenHeight } = Dimensions.get('window');

interface CustomDropdownInputProps<T> {
    label: string,
    options: T[],
    value: T,
    onChange: (data: T | null) => void,
    valueGetter: (data: T) => string,
    keyGetter: (data: T) => any,
    onSearch?: (str: string) => void,
    scrollable?: boolean
};

export function NewCustomDropdown<T>({ label, options, value, onChange, valueGetter, keyGetter, onSearch, scrollable }: CustomDropdownInputProps<T>) {
    const [filteredOptions, setFilteredOptions] = useState(options);
    const [selectedItem, setSelectedItem] = useState<T | null>(null);
    const [clearButton, setClearButton] = useState(true);
    const [isFocused,setIsFocused] = useState(false)
    const [searchTxt, setSearchTxt] = useState('')
    // const searchBoxRef = useRef<any>(null);
    // const [searchBoxY, setSearchBoxY] = useState(0);
    // const [searchBoxWidth, setSearchBoxWidth] = useState(0);

    const maxHeight = screenHeight * 0.3;

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

    // const handleLayout = () => {
    //     searchBoxRef.current.measure((fx: number, fy: number, width: number, height: number, px: number, py: number) => {
    //       setSearchBoxY(py);
    //       setSearchBoxWidth(width);
    //     });
    //   };

    const renderOption = ({ item, index }) => {
        return (
            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    alignContent: 'center',
                    alignItems: 'center',
                    borderColor: '#B8B8B8',
                    borderWidth: 0.2,
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

    const ListHeader = () => (
        <View style={{
            flexDirection: 'row',
            alignContent: 'center',
            alignItems: 'center',
            borderColor: '#B8B8B8',
            borderWidth: 0.2,
            padding: 10,
        }}>
          <Text style={commonStyles.dropdownOptionsContent}>List Header</Text>
        </View>
      );
      
      const ListFooter = () => (
        <View style={{
            flexDirection: 'row',
            alignContent: 'center',
            alignItems: 'center',
            borderColor: '#B8B8B8',
            borderWidth: 0.2,
            padding: 10,
        }}>
          <Text style={commonStyles.dropdownOptionsContent}>List Footer</Text>
        </View>
      );

    return (

        <View style={{ width: '100%'}}>
            <TextInput
                // ref={searchBoxRef}
                style={{
                    height: 54,
                    fontFamily: 'Inter-Regular',
                    width: '100%',
                    borderWidth: 2,
                    borderColor: "#ccc",
                    backgroundColor: 'white',
                    padding: 10,
                    marginBottom: 10,
                    paddingBottom: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: 'center', fontSize: 15,
                    shadowColor: 'black',
                    shadowOpacity: 0.5,
                    elevation: 3,
                    shadowRadius: 1,
                    shadowOffset: { width: 1, height: 4 },
                    borderRadius: 10,
                    color: lightTheme ? '#333' : 'black',
                    fontWeight: 'normal',
                    
                }}
                value={selectedItem ? valueGetter(selectedItem) : searchTxt}
                placeholder={label}
                placeholderTextColor={'black'}
                onChangeText={handleSearch}
                onFocus={(e) => { setOptionsVisible(true) ;setIsFocused(true)}}
                // onLayout={handleLayout}
                // onBlur={() => {setIsFocused(false)}}
            />

            {clearButton && selectedItem && (
                <TouchableOpacity style={customDropdownStyles.clearButton}
                    onPress={clearSelection}  >
                    <Icon name="close-circle" size={25} color="red" />
                </TouchableOpacity>
            )}

            {/* <Modal
                visible={optionsVisible}
                transparent={true}
                animationType='fade'
                onRequestClose={() => {setOptionsVisible(false)}}
            >
                <View style= {{flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
                    <View 
                        style={[{
                            position: 'absolute',
                            backgroundColor: '#fff',
                            borderRadius: 4,
                            padding: 10,
                            borderWidth: 1,
                            borderColor: '#ddd',
                            zIndex: 1000,
                        }, {top: searchBoxY, width: searchBoxWidth}]}
                    >
                    
                    </View>
                </View>
            </Modal> */}
            {optionsVisible && <FlatList
                data={filteredOptions}
                renderItem={renderOption}
                keyboardShouldPersistTaps="handled"
                keyExtractor={(item) => keyGetter(item)}
                scrollEnabled={scrollable ? true : false}
                style={{ maxHeight: maxHeight, marginLeft: 13, width: "93%", borderColor: "#B8B8B8", borderWidth: 0, borderRadius: 10, backgroundColor: "white" }}
            />}
        </View>
    );
}

