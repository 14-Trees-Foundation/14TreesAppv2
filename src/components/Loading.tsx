import { Modal } from "react-native"
import { View } from "react-native-animatable"
import { ActivityIndicator } from "react-native-paper"

interface LoadingInputProps {
    loading: boolean
}

export const Loading: React.FC<LoadingInputProps> = ({ loading }) => {

    return (
        <Modal
            visible={loading}
            transparent
        >
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}>
                <ActivityIndicator animating={true} size={'large'} color='green'/>
            </View>
        </Modal>
    )
}