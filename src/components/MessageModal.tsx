import { FC } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

interface MessageModalProps {
    visible: boolean;
    text: string;
}

const MessageModal: FC<MessageModalProps> = ({ visible, text }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text variant='bodyMedium'>{text}</Text>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
        width: 300,
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
});

export default MessageModal;
