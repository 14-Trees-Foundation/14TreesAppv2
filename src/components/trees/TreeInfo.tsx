import { Text, View, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { Button } from 'react-native-paper';
import { Tree } from '../../model/tree';

interface TreeInfoInputProps {
    isVisible: boolean
    tree: Tree
    plantType: string
    plot: string
    onClose: () => void
}

export const TreeInfo: React.FC<TreeInfoInputProps> = ({ isVisible, tree, plantType, plot, onClose }) => {
    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            backdropColor="black"
            backdropOpacity={0.5}
            style={{ alignItems: 'center' }}
        >
            <View style={styles.container}>
                <Text style={styles.title}>Tree Information</Text>
                <Text style={styles.label}>Sapling Id:</Text>
                <Text style={styles.value}>{tree.sapling_id}</Text>
                <Text style={styles.label}>Plant Type:</Text>
                <Text style={styles.value}>{plantType}</Text>
                <Text style={styles.label}>Plot:</Text>
                <Text style={styles.value}>{plot}</Text>
                <Button style={styles.closeButton} onPress={onClose}>Close</Button>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        margin: 10,
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        width: '100%',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
        marginBottom: 1,
        color: '#333',
    },
    value: {
        fontWeight: 'normal',
        color: '#333',
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#55cf5f',
    },
});

export default TreeInfo;
