import { View, Text } from "react-native";
import { ScreenHeaderContentStyles } from "../services/Styles";
import { APP_VERSION } from "../constants/constants";

const ScreenHeaderContent = () => {

    return (
        <View
            style={ScreenHeaderContentStyles.container}
        >
            <View style={{  
                height: 35, 
                backgroundColor: "#37B281", 
                marginRight: 10, 
                borderRadius: 10, 
                borderColor: "white", 
                borderWidth: 1,
                justifyContent: 'center',
                alineItems: 'center'
            }}>
                <Text style={{ color: "white", fontSize: 20, paddingVertical: 2, paddingHorizontal: 8}}>{APP_VERSION}v</Text>
            </View>
        </View>
    )
}

export default ScreenHeaderContent;
