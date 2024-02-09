import { View, Text, Modal, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Dimensions, Image, } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import { Utils } from '../services/Utils';
import { Strings } from '../services/Strings';
import { CancelButton, MyIconButton, SaveButton } from './Components';
const { height, width } = Dimensions.get('window');

const LanguageModal = ({ langModalVisible, setLangModalVisible, handleLanguageChange }) => {

  const [selectedLang, setSelectedLang] = useState(Strings.english);

  const [languages, setLangauges] = useState([
    { name: 'English', code: Strings.english, selected: true },
    { name: 'मराठी', code: Strings.marathi, selected: false },
  ]);

  const onSelect = (index) => {
    const updatedLanguages = languages.map((item, ind) => {
      if (index === ind) {
        return { ...item, selected: true };
      } else {
        return { ...item, selected: false };
      }
    });

    setLangauges(updatedLanguages);
    setSelectedLang(updatedLanguages[index].code);
  };

  const handleLanguageChanges = async () => {
    let storedlang = await Strings.getLanguage();
   
    if (selectedLang !== storedlang) {
      console.log("changing language");
      await Strings.setLanguage(selectedLang);
      handleLanguageChange(selectedLang); // Notify the HomeScreen about language change
    } else {
      console.log("no need to change language");
    }

    setLangModalVisible(false);
  };

  const handleCancelChanges = async () => {
    let storedlang = await Strings.getLanguage();
  
    const index = storedlang === "en" ? 0 : 1;

    if (selectedLang !== storedlang) {
      //correct the selected language
      onSelect(index);
    }

    setLangModalVisible(false);
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={langModalVisible}
      onRequestClose={() => {
        setLangModalVisible(!langModalVisible);
      }}>

      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.title}>Select Language</Text>
          <View style={{ width: '100%' }}>
            <FlatList
              data={languages}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity
                    style={[
                      styles.languageItem,
                      { borderColor: item.selected == true ? 'blue' : 'black' },
                    ]}
                    onPress={() => {
                      onSelect(index);
                    }}>
                    {item.selected == true ? (
                      <Image
                        source={require('../../assets/selected.png')}
                        style={[styles.icon, { tintColor: 'blue' }]}
                      />
                    ) : (
                      <Image
                        source={require('../../assets/non_selected.png')}
                        style={styles.icon}
                      />
                    )}

                    <Text
                      style={{
                        marginLeft: 20,
                        fontSize: 18,
                        color: item.selected == true ? 'blue' : 'black',
                      }}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
          <View style={styles.btns}>
            <CancelButton
              onPress={handleCancelChanges}
            />
            <SaveButton
              onPress={handleLanguageChanges}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LanguageModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: 'rgba(0,0,0,.5)',
  },
  modalView: {
    margin: 20,
    width: width - 20,
    // height: height / 2,

    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  languageItem: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    borderWidth: 0.5,
    marginTop: 10,
    paddingLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
  btns: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  btn2: {
    width: '40%',
    height: 50,
    borderWidth: 0.5,
    borderRadius: 10,
    backgroundColor: '#4B68E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});