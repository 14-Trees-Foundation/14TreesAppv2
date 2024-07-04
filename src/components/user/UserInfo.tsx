
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import moment from 'moment';
import { Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useState } from 'react';
import { User } from '../../model/user';

interface UserInfoInputProps {
    isVisible: boolean
    user: User
    onClose: () => void
    onEdit: () => void
    onDelete: () => void
}

export const UserInfo: React.FC<UserInfoInputProps> = ({ isVisible, user, onClose, onDelete, onEdit }) => {

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
                    <Text style={styles.title}>User Information</Text>
                    <TouchableOpacity style={styles.icons} onPress={() => { onClose(); onEdit(); }}>
                        <Icon name="edit" size={24} color="green" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.icons} onPress={ () => { setIsDelete(true) }}>
                        <Icon name="trash" size={24} color="red" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{user.name}</Text>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{user.email}</Text>
                <Text style={styles.label}>Contact No.:</Text>
                <Text style={styles.value}>{user.phone}</Text>
                <Text style={styles.label}>Date of Birth:</Text>
                <Text style={styles.value}>{moment(user.birth_date).format('MMMM D, YYYY')}</Text>
                <Text style={styles.label}>Last Updated:</Text>
                <Text style={styles.value}>{moment(user.updated_at).format('MMMM D, YYYY HH:mm')}</Text>
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
                    <Text style={styles.deleteTitle}>Delete user "{user.name}"?</Text>
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
    },
    value: {
        fontWeight: 'normal',
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
        backgroundColor: "#55cf5f"
    },
    cancelButton: { 
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
    },
    deleteButton: {
        backgroundColor: '#e82a2a',
        borderRadius: 5
    }
});

export default UserInfo;
