import { FC } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { Strings } from "../services/Strings";

interface MessageModalProps {
    visible: boolean;
    text: string;
    onClose?: () => void
}

const MessageModal: FC<MessageModalProps> = ({ visible, text, onClose }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text variant='bodyMedium'>{text}</Text>
                    {onClose && <View style={styles.btnContainer}>
                        <Button
                            onPress={onClose}
                            style={styles.closeBtn}
                            labelStyle={styles.closeBtnLabel}
                        >
                            {Strings.buttonLabels.Ok}
                        </Button>
                    </View>}
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
    btnContainer: {
        marginTop: 10,
        flexGrow: 1,
        alignItems: 'flex-end'
    },
    closeBtn: {
        flexGrow: 1,
    },
    closeBtnLabel: {
        color: '#4CAF50',
    }
});

export default MessageModal;
