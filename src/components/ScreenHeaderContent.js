import { useContext, useState } from "react";
import { Image, TouchableOpacity, View, StyleSheet, Text } from "react-native";
import LanguageModal from "./Languagemodal";
import GlobalContext from "../context/GlobalContext ";
import { ScreenHeaderContentStyles, aboutStyles } from "../services/Styles";
import { APP_VERSION } from "../constants/constants";

const ScreenHeaderContent = () => {

    const [langModalVisible, setLangModalVisible] = useState(false);
    const [toggleMode, setToggleMode] = useState(false); //dark by default
    const { lightTheme, setLightTheme } = useContext(GlobalContext);

    return (
        <View
            style={ScreenHeaderContentStyles.container}
        >
            <View style={{  height: 35, backgroundColor: "#37B281", marginRight: 10, borderRadius: 10, borderColor: "white", borderWidth: 1 }}>
                <Text style={{ color: "white", fontSize: 20, fontWeight: "bold", paddingLeft: 4, paddingTop: 2 }}>{APP_VERSION}</Text>
            </View>
            
            <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={() => {
                    setToggleMode(!toggleMode);
                    setLightTheme(!lightTheme);
                }}
            >
                {!toggleMode ? <Image
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
