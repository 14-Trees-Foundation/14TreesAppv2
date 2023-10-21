import { TouchableOpacity,Text,View } from "react-native";
import { commonStyles } from "./Utils";
export const CustomButton = ({ text, opacityStyle,textStyle, onPress }) => {
    let finalOpacityStyle = commonStyles.defaultButtonStyle;
    if(opacityStyle){
        finalOpacityStyle = {...finalOpacityStyle,...opacityStyle};
    }
    let finalTextStyle = commonStyles.defaultButtonTextStyle;
    if(textStyle){
        finalTextStyle = {...finalTextStyle,...textStyle};
    }
    return (<TouchableOpacity onPress={onPress}>
        <View style={finalOpacityStyle}>
            <Text style={finalTextStyle}>{text}</Text>
        </View>
    </TouchableOpacity>);
}