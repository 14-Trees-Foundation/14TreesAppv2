import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { measureNetworkSpeed } from '../services/network';
import LoadingScreen from '../screens/LoadingScreen';
import { formatDuration } from '../services/Utils';
import { Modal } from 'react-native';
import { Strings } from '../services/Strings';

interface NetworkSpeedModalProps {
    visible: boolean
    onClose: () => void
    onSubmit: (networkSpeedInKBps: number) => void
    dataSize: number
}

const NetworkSpeedModal: React.FC<NetworkSpeedModalProps> = ({ visible, dataSize, onClose, onSubmit }) => {
    const [checkingSpeed, setCheckingSpeed] = useState(true);
    const [networkSpeed, setNetworkSpeed] = useState(0);
    const [syncTime, setSyncTime] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (visible) {
            checkNetworkSpeed();
        }
    }, [visible]);

    const checkNetworkSpeed = async () => {
        setCheckingSpeed(true);
        try {
            const speedInKBps = await measureNetworkSpeed();
            const requiredTime = dataSize / (8 * 1024 * speedInKBps)

            setNetworkSpeed(speedInKBps)
            setSyncTime(formatDuration(requiredTime * 1000))
        } catch (err: any) {
            setError(err.message);
        }
        setCheckingSpeed(false);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {checkingSpeed ? (
                        <View style={styles.contentContainer}>
                            <View style={{ maxHeight: '50%', marginTop: 30 }}>
                                <LoadingScreen />
                            </View>
                            <Text style={styles.text}>Checking internet speed...</Text>
                        </View>
                    ) : error !== '' ? (
                        <View style={styles.contentContainer}>
                            <Text style={styles.text}>Error: {error}</Text>
                            <View style={styles.buttonContainer}>
                                <Button onPress={onClose}>OK</Button>
                            </View>
                        </View>
                    ) : (
                        <View style={{ ...styles.contentContainer, alignItems: 'flex-start'}}>
                            <View style={styles.textLine}>
                                <Text style={styles.textTitle}>{Strings.messages.NetworkSpeed}: </Text>
                                <Text style={styles.text}>{networkSpeed >= 1024 ? (networkSpeed/1024).toFixed(1) + ' MBps' : networkSpeed.toFixed(0)+ ' KBps'}</Text>
                            </View>
                            <View style={styles.textLine}>
                                <Text style={styles.textTitle}>{Strings.messages.EstimatedTimeToSync}: </Text>
                                <Text style={styles.text}>{syncTime}</Text>
                            </View>
                            <Text style={styles.text}>{Strings.messages.WishToContinue}</Text>
                            <View style={styles.buttonContainer}>
                                <Button onPress={onClose}>Cancel</Button>
                                {!checkingSpeed && <Button onPress={() => {
                                    onSubmit(networkSpeed);
                                    onClose();
                                }}>Yes</Button>}
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        maxHeight: '50%'
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    text: {
        color: 'black',
        fontSize: 16,
        marginVertical: 5,
    },
    textTitle: {
        color: 'black',
        fontSize: 16,
        marginVertical: 5,
        fontWeight: 'bold'
    },
    textLine: {
        width: '100%',
        flexDirection: 'row',
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    button: {
        flex: 1,
        padding: 10,
        marginHorizontal: 5,
        backgroundColor: '#2196F3',
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default NetworkSpeedModal;
