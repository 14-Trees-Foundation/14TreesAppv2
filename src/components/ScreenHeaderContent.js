import { useContext, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import LanguageModal from "./Languagemodal";
import GlobalContext from "../context/GlobalContext ";

const ScreenHeaderContent = () => {

    const [langModalVisible, setLangModalVisible] = useState(false);
    const [toggleMode, setToggleMode] = useState(false);
    const { lightTheme, setLightTheme } = useContext(GlobalContext);

    return (
        <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}
        >
            {/* togglebutton */}
            <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={() => {
                    console.log('changing the theme', lightTheme);
                    setToggleMode(!toggleMode);
                    setLightTheme(!lightTheme);
                }}
            >
                {toggleMode ? <Image
                    source={require('../../assets/icon-brightness-on.png')}
                    style={{ width: 35, height: 35, borderRadius: 37.5 }}
                /> : <Image
                    source={require('../../assets/icon-brightness.png')}
                    style={{ width: 35, height: 35, borderRadius: 37.5 }}
                />}
            </TouchableOpacity>

            {/* language button */}
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
