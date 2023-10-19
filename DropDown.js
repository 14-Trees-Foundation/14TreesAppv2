import React from 'react';
import {View} from 'react-native';
import SearchableDropdown from './SearchableDropdown';

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
        initValue={selectedItem}
        //suggestion container style
        textInputStyle={{
          height: 60,
          width: 310,
          borderWidth: 0.5,
          borderColor: 'grey',
          borderRadius: 10,
          backgroundColor: '#f5f5f5',
          marginTop: 10,
          marginBottom: 10,
          padding: 10,
          color: 'black', // Change font color here
          fontSize: 16,
          fontWeight: 'bold',  
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
        }}
        itemStyle={{
          //single dropdown item style
          padding: 10,
          margin: 2,
          backgroundColor: '#5DB075',
          borderColor: '#9BC53D',
          borderWidth: 1,
          borderRadius: 10,
          width: 310,
          height: 60,
          justifyContent: 'center',
          alignSelf: 'center',
          
        }}
        itemTextStyle={{
          //text style of a single dropdown item
          color: '#ffffff',
          fontSize: 16,
          
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