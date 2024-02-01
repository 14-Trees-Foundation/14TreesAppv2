import * as Progress from 'react-native-progress';
import { View } from 'react-native';

const LoadingScreen = () => {
    return(
    <View style={{ alignItems: 'center', justifyContent: 'center', alignContent: 'center', height: '100%' }}>
        <Progress.CircleSnail size={100} color={'green'} 
        thickness={10} duration={700} spinDuration={2000} />
    </View>)
}

export default LoadingScreen;