import { TouchableOpacity,Text,View } from "react-native";
import { styles } from "./Utils";
export const CustomButton = ({ text, opacityStyle,textStyle, onPress }) => {
    let finalOpacityStyle = styles.defaultButtonStyle;
    if(opacityStyle){
        finalOpacityStyle = {...finalOpacityStyle,...opacityStyle};
    }
    let finalTextStyle = styles.defaultButtonTextStyle;
    if(textStyle){
        finalTextStyle = {...finalTextStyle,...textStyle};
    }
    return (<TouchableOpacity onPress={onPress}>
        <View style={finalOpacityStyle}>
            <Text style={finalTextStyle}>{text}</Text>
        </View>
    </TouchableOpacity>);
}