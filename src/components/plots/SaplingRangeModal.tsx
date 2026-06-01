import React, { FC, useState } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { Strings } from '../../services/Strings';

interface SaplingRangeModalProps {
    visible: boolean,
    onClose: () => void
    onSubmit: (saplings: string[]) => void
}

const SaplingRangeModal: FC<SaplingRangeModalProps> = ({ visible, onClose, onSubmit }) => {
    const [firstNumber, setFirstNumber] = useState('');
    const [secondNumber, setSecondNumber] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSave = () => {
        const firstNum = parseInt(firstNumber);
        const secondNum = parseInt(secondNumber);

        if (isNaN(firstNum) || isNaN(secondNum)) {
            setErrorMessage('Please enter valid numbers.');
        } else if (secondNum <= firstNum) {
            setErrorMessage('The second number must be greater than the first.');
        } else {
            const saplings: string[] = []
            for (let i = firstNum; i <= secondNum; i++){
                saplings.push(i.toString());
            }

            setErrorMessage('');
            onClose();
            onSubmit(saplings);
        }
    };

    return (
        <Modal visible={visible} transparent={true} animationType="slide">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Enter Sapling Range</Text>
                    <TextInput
                        style={styles.input}
                        label="Start sapling number"
                        keyboardType="numeric"
                        value={firstNumber}
                        onChangeText={setFirstNumber}
                        mode='outlined'
                    />
                    <TextInput
                        style={styles.input}
                        label="End sapling number"
                        keyboardType="numeric"
                        value={secondNumber}
                        onChangeText={setSecondNumber}
                        mode='outlined'
                    />
                    {errorMessage && <HelperText visible={true} type='error'>{errorMessage}</HelperText>}
                    <View style={styles.btnContainer}>
                        <Button
                            mode="outlined"
                            onPress={onClose}
                            style={styles.cancelButton}
                            labelStyle={styles.cancelButtonLabel}
                        >
                            {Strings.buttonLabels.cancel}
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleSave}
                            style={styles.submitButton}
                            labelStyle={styles.submitButtonLabel}
                        >
                            {Strings.buttonLabels.Submit}
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        marginBottom: 15,
        color: 'black'
    },
    input: {
        width: '100%',
        borderColor: 'gray',
        marginBottom: 10,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
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

export default SaplingRangeModal;
