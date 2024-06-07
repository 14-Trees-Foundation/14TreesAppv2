import { useContext, useState } from "react";
import { Image, TouchableOpacity, View,StyleSheet } from "react-native";
import LanguageModal from "./Languagemodal";
import GlobalContext from "../context/GlobalContext ";
import { ScreenHeaderContentStyles } from "../services/Styles";

const ScreenHeaderContent = () => {

    const [langModalVisible, setLangModalVisible] = useState(false);
    const [toggleMode, setToggleMode] = useState(false); //dark by default
    const { lightTheme, setLightTheme } = useContext(GlobalContext);

    return (
        <View
            style={ScreenHeaderContentStyles.container}
        >
            
            <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={() => {
                    //console.log('changing the theme', lightTheme);
                    setToggleMode(!toggleMode);
                    setLightTheme(!lightTheme);
                }}
            >
                {toggleMode ? <Image
                    source={require('../../assets/icon-brightness-on.png')}
                    style={ScreenHeaderContentStyles.modeIcon}
                /> : <Image
                    source={require('../../assets/icon-brightness.png')}
                    style={ScreenHeaderContentStyles.modeIcon}
                />}
            </TouchableOpacity>

            
            <TouchableOpacity
                style={{ marginRight: 35 }}
                onPress={() => {
                    console.log('set your language');
                    setLangModalVisible(true);
                }}
            >
                <Image
                    source={require('../../assets/icon-language.png')}
                    style={{ width: 35, height: 35 }}
                />
            </TouchableOpacity>

            <LanguageModal
                langModalVisible={langModalVisible}
                setLangModalVisible={setLangModalVisible}

            />
        </View>
    )
}




export default ScreenHeaderContent;
