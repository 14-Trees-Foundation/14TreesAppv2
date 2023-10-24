import { TouchableOpacity,Text,View } from "react-native";
import { Utils, commonStyles, fontAwesome5List } from "./Utils";
import Fa5Icon from 'react-native-vector-icons/FontAwesome5';
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
    return <Text>??</Text>
}

export function MyIconButton({name,size,color,onPress,iconColor='white',text=undefined}){
    console.log(name,size,color)
    if(fontAwesome5List.includes(name)){
        return <TouchableOpacity style={{padding:5,margin:5,borderRadius:5,backgroundColor:color,flexDirection:'row',justifyContent:'center',alignItems:'center'}} onPress={onPress}>
            <MyIcon name={name} size={size} color={iconColor}></MyIcon>
            {text&&<Text>{text}</Text>}
        </TouchableOpacity>
        return <Fa5Icon.Button name={name} backgroundColor={color} onPress={onPress}>
            {text&&<Text>{text}</Text>}
            </Fa5Icon.Button>;
    }
    return <Text>??</Text>
}

