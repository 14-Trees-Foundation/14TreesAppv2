import { FC } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { Strings } from "../services/Strings";

interface ConfirmationModalProps {
    visible: boolean;
    text: string;
    onCancel: () => void;
    onSubmit: () => void;
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({ visible, text, onCancel, onSubmit }) => {
    return (
        <Modal
            visible={visible}
            onRequestClose={onCancel}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text variant='bodyMedium'>{text}</Text>
                    <View style={styles.btnContainer}>
                        <Button
                            mode="outlined"
                            onPress={onCancel}
                            style={styles.cancelButton}
                            labelStyle={styles.cancelButtonLabel}
                        >
                            {Strings.buttonLabels.cancel}
                        </Button>
                        <Button
                            mode="contained"
                            onPress={onSubmit}
                            style={styles.submitButton}
                            labelStyle={styles.submitButtonLabel}
                        >
                            {Strings.buttonLabels.Yes}
                        </Button>
                    </View>
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
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flex: 1,
        marginRight: 10,
        borderColor: '#FF6666',
    },
    cancelButtonLabel: {
        color: '#FF6666',
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        flex: 1,
    },
    submitButtonLabel: {
        color: 'white',
    },
});

export default ConfirmationModal;
