import { TouchableOpacity,Text,View } from "react-native";
import { Utils, commonStyles, fontAwesome5List, materialCommunityList } from "./Utils";
import Fa5Icon from 'react-native-vector-icons/FontAwesome5';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
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

export function MyIcon({name,size,color}){
    console.log(name,size,color)
    if(fontAwesome5List.includes(name)){
        return <Fa5Icon name={name} size={size} color={color}/>;
    }
    else if(materialCommunityList.includes(name)){
        return <MCIcon name={name} size={size} color = {color}/>;
    }
    return <Text>??</Text>
}

export function MyIconButton({name,size,color,onPress,iconColor='white',text=undefined}){
    console.log(name,size,color)
    return <TouchableOpacity style={{...commonStyles.iconBtn,backgroundColor: color,}} onPress={onPress}>
            <MyIcon name={name} size={size} color={iconColor}></MyIcon>
            </TouchableOpacity>
}

