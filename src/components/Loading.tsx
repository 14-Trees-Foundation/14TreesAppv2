import { Modal } from "react-native"
import { View } from "react-native-animatable"
import { Text } from "react-native-paper"
import { CircleSnail } from "react-native-progress"

interface LoadingInputProps {
    loading: boolean
    text?: string
}

export const Loading: React.FC<LoadingInputProps> = ({ loading, text }) => {

    return (
        <Modal
            visible={loading}
            transparent
        >
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }}>
                <CircleSnail size={70} color={'#059636'}
                    thickness={6} duration={700} spinDuration={2000} />
                <Text variant='bodyMedium' style={{ color: 'black' }}>{ text ? text : 'Loading...'}</Text>
            </View>
        </Modal>
    )
}