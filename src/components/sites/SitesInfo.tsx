
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useState } from 'react';
import { Site } from '../../model/sites';

interface SiteInfoInputProps {
    isVisible: boolean
    site: Site
    onClose: () => void
    onEdit: () => void
    onDelete: () => void
}

export const SiteInfo: React.FC<SiteInfoInputProps> = ({ isVisible, site, onClose, onDelete, onEdit }) => {

    const [isDelete, setIsDelete] = useState(false);

    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            backdropColor="black"
            backdropOpacity={0.5}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Site Information</Text>
                    {/* <TouchableOpacity style={styles.icons} onPress={() => { onClose(); onEdit(); }}>
                        <Icon name="edit" size={24} color="green" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.icons} onPress={ () => { setIsDelete(true) }}>
                        <Icon name="trash" size={24} color="red" />
                    </TouchableOpacity> */}
                </View>
                <Text style={styles.label}>Name (English):</Text>
                <Text style={styles.value}>{site.name_english}</Text>
                <Text style={styles.label}>Name (Marathi):</Text>
                <Text style={styles.value}>{site.name_marathi}</Text>
                
                <Button style={styles.closeButton} onPress={onClose} >
                    Close
                </Button>
            </View>

            <Modal
                isVisible={isDelete}
                onBackdropPress={() => { setIsDelete(false); }}
                backdropColor="black"
                backdropOpacity={0.5}
            >
                <View style={styles.container}>
                    <Text style={styles.deleteTitle}>Delete Site "{site.name_english}"?</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Button style={styles.cancelButton} onPress={() => { setIsDelete(false);}} >
                            Cancel
                        </Button>
                        <Button style={styles.deleteButton} onPress={() => {
                            onClose();
                            setIsDelete(false);
                            onDelete();
                        }} >
                            Delete
                        </Button>
                    </View>
                </View>
            </Modal>
        </Modal>

        
    )
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
        height: 'auto'
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
        marginBottom: 1,
        color: 'black'
    },
    value: {
        fontWeight: 'normal',
        color: 'black'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%'
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'left',
        color: 'black'
    },
    deleteTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'left',
        marginBottom: 10,
    },
    icons: {
        fontSize: 20,
        fontWeight: 'bold',
        padding: 5,
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: "#55cf5f",
        color: 'black'
    },
    cancelButton: { 
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
        color: 'black'
    },
    deleteButton: {
        backgroundColor: '#e82a2a',
        borderRadius: 5,
    }
});

export default SiteInfo;
