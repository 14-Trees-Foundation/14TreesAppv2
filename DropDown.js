import React from 'react';
import {View} from 'react-native';
import SearchableDropdown from 'react-native-searchable-dropdown';

export const Dropdown = ({items, label, setSelectedItems, selectedItem}) => {
  return (
    <View>
      <SearchableDropdown
        onTextChange={text => console.log(text)}
        //On text change listner on the searchable input
        onItemSelect={item => {
          setSelectedItems(item);
        }}
        // onItemSelect={item => setplotid(item.value)}
        //onItemSelect called after the selection from the dropdown
        selectedItems={selectedItem}
        //suggestion container style
        textInputStyle={{
          paddingLeft: 20,
          borderWidth: 1,
          borderRadius: 10,
          borderColor: '#000000',
          backgroundColor: '#ffffff',
          color: '#000000',
          marginHorizontal: 10,
          marginVertical: 3,
        }}
        itemStyle={{
          //single dropdown item style
          padding: 10,
          margin: 2,
          backgroundColor: '#1f3625',
          borderColor: '#9BC53D',
          borderWidth: 1,
          borderRadius: 10,
        }}
        itemTextStyle={{
          //text style of a single dropdown item
          color: '#ffffff',
          fontSize: 20,
        }}
        itemsContainerStyle={{
          //items container style you can pass maxHeight
          //to restrict the items dropdown hieght
          maxHeight: '70%',
        }}
        items={items}
        //mapping of item array
        defaultIndex={0}
        //default selected item index
        placeholder={label}
        placeholderTextColor="#000000"
        //place holder for the search input
        resetValue={false}
        //reset textInput Value with true and false state
        underlineColorAndroid="transparent"
        //To remove the underline from the android input
      />
    </View>
  );
};