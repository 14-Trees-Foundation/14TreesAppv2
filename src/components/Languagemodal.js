import { View, Text, Modal, StyleSheet, FlatList, TouchableOpacity, Dimensions, Image, } from 'react-native';
import React, { useState, useContext } from 'react';
import { Strings } from '../services/Strings';
const { height, width } = Dimensions.get('window');
import GlobalContext from '../context/GlobalContext ';
import { Button } from 'react-native-paper';
import { CustomButtonStyles, Iconstyles, languageModalStyles } from '../services/Styles';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const LanguageModal = ({ langModalVisible, setLangModalVisible }) => {
  const { langChanged, setLangChanged } = useContext(GlobalContext);

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
      setLangChanged(!langChanged);
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

      <View style={languageModalStyles.centeredView}>
        <View style={languageModalStyles.modalView(width)}>
          <Text style={languageModalStyles.title}>Select Language</Text>
          <View style={{ width: '100%' }}>
            <FlatList
              data={languages}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity
                    style={[
                      languageModalStyles.languageItem,
                      { borderColor: item.selected == true ? 'blue' : 'black' },
                    ]}
                    onPress={() => {
                      onSelect(index);
                    }}>
                    {item.selected === true ? (
                      <Image
                        source={require('../../assets/selected.png')}
                        style={[languageModalStyles.icon, { tintColor: 'blue' }]}
                      />
                    ) : (
                      <Image
                        source={require('../../assets/non_selected.png')}
                        style={languageModalStyles.icon}
                      />
                    )}

                    <Text
                      style={{
                        marginLeft: 20,
                        fontSize: 18,
                        color: item.selected === true ? 'blue' : 'black',
                      }}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          <View style={languageModalStyles.btns}>
            <View style={CustomButtonStyles.buttonRow}>
              <View style={CustomButtonStyles.buttonContainer}>
                <Button
                  icon={() => (
                    <View style={Iconstyles.buttonContent}>
                      <MCIcon name="cancel" size={30} color="white" />
                    </View>
                  )}
                  //mode="contained"
                  buttonColor='red'
                  labelStyle={{ ...CustomButtonStyles.buttonLabel, fontSize: 15 }}
                  style={CustomButtonStyles.button}
                  onPress={handleCancelChanges}
                >
                  {Strings.buttonLabels.cancel}
                </Button>

              </View>
              <View style={CustomButtonStyles.buttonContainer}>
                <Button
                  icon={() => (
                    <View style={Iconstyles.buttonContent}>
                      <MCIcon name="check" size={30} color="white" />
                    </View>
                  )}
                  onPress={handleLanguageChanges}
                  //mode="contained"
                  buttonColor='#059636'
                  labelStyle={{ ...CustomButtonStyles.buttonLabel, fontSize: 15 }}
                  style={CustomButtonStyles.button}
                >
                  {Strings.buttonLabels.Submit}
                </Button>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LanguageModal;

