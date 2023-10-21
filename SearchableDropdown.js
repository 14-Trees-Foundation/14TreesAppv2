import React, { Component } from 'react';
import {
  Text,
  FlatList,
  TextInput,
  View,
  TouchableOpacity,
  Keyboard
} from 'react-native';

const defaultItemValue = {
  name: '', id: 0
};

export default class SearchableDropDown extends Component {
  constructor(props) {
    super(props);
    this.renderTextInput = this.renderTextInput.bind(this);
    this.renderFlatList = this.renderFlatList.bind(this);
    this.searchedItems = this.searchedItems.bind(this);
    this.renderItems = this.renderItems.bind(this);
    this.state = {
      item: {},
      listItems: [],
      focus: false
    };
  }

  renderFlatList = () => {
    if (this.state.focus) {
      const flatListPorps = { ...this.props.listProps };
      const oldSupport = [
        { key: 'keyboardShouldPersistTaps', val: 'always' }, 
        { key: 'nestedScrollEnabled', val : false },
        { key: 'style', val : { ...this.props.itemsContainerStyle } },
        { key: 'data', val : this.state.listItems },
        { key: 'keyExtractor', val : (item, index) => index.toString() },
        { key: 'renderItem', val : ({ item, index }) => this.renderItems(item, index) },
      ];
      oldSupport.forEach((kv) => {
        if(!Object.keys(flatListPorps).includes(kv.key)) {
          flatListPorps[kv.key] = kv.val;
        } else {
          if(kv.key === 'style') {
            flatListPorps['style'] = kv.val;
          }
        }
      });
      return (
        <FlatList
          { ...flatListPorps }
        />
      );
    }
  };

  componentDidMount = () => {
    console.log('component mounted')
    const listItems = this.props.items;
    const defaultIndex = this.props.defaultIndex;
    const currentValue = this.props.currentValue;
    let item = null;
    if(defaultIndex && listItems.length > defaultIndex){
        item = listItems[defaultIndex];
    }
    else if(currentValue){
        item = currentValue;
    }
    if (item) {
      this.setState({
        listItems,
        item:item 
      });
    } else {
      this.setState({ listItems });
    }
  };

  searchedItems = searchedText => {
    let setSort = this.props.setSort;
    if (!setSort && typeof setSort !== 'function') {
        setSort = (item, searchedText) => { 
          return item.name.toLowerCase().indexOf(searchedText.toLowerCase()) > -1
        };
    }
    var ac = this.props.items.filter((item) => {
      return setSort(item, searchedText);
    });
    let item = {
      id: -1,
      name: searchedText
    };
    this.setState({ listItems: ac, item: item });
  };

  renderItems = (item, index) => {
      return (
        <TouchableOpacity
          style={{ ...this.props.itemStyle }}
          onPress={() => {
            this.setState({ item: item, focus: false });
            Keyboard.dismiss();
            setTimeout(() => {
              this.props.onItemSelect(item);
              const newState = {...this.state,item:item}
              this.setState(newState);
              console.log('Set state to: ',newState.item)
            }, 0);
          }}
        >
          { 
            this.props.selectedItems && this.props.selectedItems.find(x => x.id === this.state.item.id) 
            ?
              <Text style={{ ...this.props.itemTextStyle }}>{item.name}</Text>
            :
              <Text style={{ ...this.props.itemTextStyle }}>{item.name}</Text>
          }
        </TouchableOpacity>
      );
  };

  renderListType = () => {
    return this.renderFlatList();
  };

  renderTextInput = () => {
    const textInputProps = { ...this.props.textInputProps };
    console.log('rendering ti',this.state.item)
    const oldSupport = [
      { key: 'ref', val: e => (this.input = e) }, 
      { key: 'onTextChange', val: (text) => { this.searchedItems(text) } }, 
      { key: 'underlineColorAndroid', val: this.props.underlineColorAndroid }, 
      { 
        key: 'onFocus', 
        val: () => {
          this.props.onFocus && this.props.onFocus()
          this.setState({
            focus: true,
            item: defaultItemValue,
            listItems: this.props.items
          });
        } 
      }, 
      {
        key: 'onBlur',
        val: () => {
          this.props.onBlur && this.props.onBlur(this);
          this.setState({ ...this.state,focus: false });
        }
      },
      {
        key: 'value',
        val: this.state.item ? this.state.item.name : ''
      },
      {
        key: 'style',
        val: { ...this.props.textInputStyle }
      },
      {
        key: 'placeholderTextColor',
        val: this.props.placeholderTextColor
      },
      {
        key: 'placeholder',
        val: this.props.placeholder
      }
    ];
    oldSupport.forEach((kv) => {
      if(!Object.keys(textInputProps).includes(kv.key)) {
        if(kv.key === 'onTextChange' || kv.key === 'onChangeText') {
          textInputProps['onChangeText'] = kv.val;
        } else {
          textInputProps[kv.key] = kv.val;
        }
      } else {
        if(kv.key === 'onTextChange' || kv.key === 'onChangeText') {
          textInputProps['onChangeText'] = kv.val;
        }
      }
    });
    return (
      <TextInput
      { ...textInputProps }
      onBlur={(e) => {
        if (this.props.onBlur) {
          this.props.onBlur(e);
        }
        if (this.props.textInputProps && this.props.textInputProps.onBlur) {
          this.props.textInputProps.onBlur(e);
        }
        this.setState({ ...this.state,focus: false });
      }
      }
      />
    )
  }

  render = () => {
    return (
      <View
        keyboardShouldPersist="always"
        style={{ ...this.props.containerStyle }}
      >
        { this.renderSelectedItems() }
        { this.renderTextInput() }
        {this.renderListType()}
      </View>
    );
  };
  renderSelectedItems(){
    let items = this.props.selectedItems || [];
    if(items !== undefined && items.length > 0 && this.props.chip && this.props.multi){
     return  <View style={{flexDirection: 'row',  flexWrap: 'wrap', paddingBottom: 10, marginTop: 5 }}>
                 { items.map((item, index) => {
                     return (
                         <View key={index} style={{
                                 width: (item.name.length * 8) + 60,
                                 justifyContent: 'center',
                                 flex: 0,
                                 backgroundColor: '#eee',
                                 flexDirection: 'row',
                                 alignItems: 'center',
                                 margin: 5,
                                 padding: 8,
                                 borderRadius: 15,
                             }}>
                             <Text style={{ color: '#555' }}>{item.name}</Text>
                             <TouchableOpacity onPress={() => setTimeout(() => { this.props.onRemoveItem(item, index) }, 0) } style={{ backgroundColor: '#f16d6b', alignItems: 'center', justifyContent: 'center', width: 25, height: 25, borderRadius: 100, marginLeft: 10}}>
                                 <Text>X</Text>
                             </TouchableOpacity>
                         </View>
                 )
             }) 
         }
         </View>
    }
 }
}