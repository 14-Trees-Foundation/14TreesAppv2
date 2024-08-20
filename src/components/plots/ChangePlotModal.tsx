import { FC } from "react";
import { Modal, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import SaplingChipList from "./SaplingChipList";

interface ChangePlotModalProps {
    visible: boolean,
    fromPlot: string,
    toPlot: string,
    selectedSaplings: string[]
    onClose: () => void
    onSubmit: () => void
}

const ChangePlotModal: FC<ChangePlotModalProps> = ({ visible, fromPlot, toPlot, selectedSaplings, onClose, onSubmit }) => {

    return (
        <Modal
            visible={visible}
            onRequestClose={onClose}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text variant='bodyMedium' style={{ fontWeight: 'bold', color: 'black' }}>Change saplings plot from:</Text>
                    <Text variant='bodyMedium' style={{ color: 'black' }}>{fromPlot}</Text>
                    <Text variant='bodyMedium' style={{ fontWeight: 'bold', color: 'black' }}>To:</Text>
                    <Text variant='bodyMedium' style={{ color: 'black' }}>{toPlot}</Text>
                    <ScrollView>
                        <SaplingChipList 
                            items={selectedSaplings}
                        />
                    </ScrollView>
                    <View style={{
                        marginTop: 20,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <Button mode="contained" onPress={onClose} style={{...styles.closeButton, backgroundColor: '#FF6666'}}>
                            Cancel
                        </Button>
                        <Button mode="contained" onPress={onSubmit} style={{ ...styles.closeButton, backgroundColor: '#4CAF50' }}>
                            Submit
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        minHeight: '30%',
        maxHeight: '60%',
    },
    closeButton: {
        marginHorizontal: 5,
        flexGrow: 1,
    },
    container: {
        position: 'relative',
    },
    iconButton: {
        position: 'absolute',
        right: 0,
        top: 8,  // Adjust this value as needed to align with the TextInput
    },
});

export default ChangePlotModal;