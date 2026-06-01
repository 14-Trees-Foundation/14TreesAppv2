import React, { useState } from 'react';
import { Modal, View, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { TextInput, IconButton } from 'react-native-paper';
import { CreateUserRequest, User } from '../../model/user';
import { Strings } from '../../services/Strings';
import UserForm from '../user/UserForm';
import { DaoClient } from '../../services/db/dao';

interface UserUpsertFormInputProps {
    value: User | null
    onSelect: (user: User | null) => void
}

const UserUpsertForm: React.FC<UserUpsertFormInputProps> = ({ value, onSelect }) => {

    const [visible, setVisible] = useState(false);

    const handleClose = () => setVisible(false);

    const handleSaveUser = async (data: CreateUserRequest) => {
        const daoClient = await DaoClient.authenticate();
        const userId =  await daoClient.users.createUser(data);

        const user = await daoClient.users.getUserByLocalId(userId);
        onSelect(user);
    }

    const handleSubmit = (userData: User | CreateUserRequest) => {
        const data: any = JSON.parse(JSON.stringify(userData));
        if (data.local_id) onSelect(data);
        else handleSaveUser(userData);
        
        handleClose();
    }

    return (
        <View>
            <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setVisible(true); }}>
                <View pointerEvents='box-only'>
                    <TextInput
                        value={value ? `${value.name} (${value.email})` : ''}
                        mode='outlined'
                        label={Strings.labels.SelectUser}
                        numberOfLines={2}
                        multiline={value ? `${value.name} (${value.email})`.length > 40 : false}
                    />
                </View>
            </TouchableWithoutFeedback>

            {value && (
                <IconButton
                    icon="close"
                    size={20}
                    onPress={() => onSelect(null)}
                    style={styles.iconButton}
                />
            )}

            <Modal
                visible={visible}
                onRequestClose={handleClose}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <UserForm 
                            changeMode={ value ? 'edit' : 'add' }
                            user={value}
                            onSubmit={handleSubmit}
                            onCancel={handleClose}
                            select
                        />
                    </View>
                </View>
            </Modal>
        </View>
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
        width: '100%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        height: '100%',
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
    paginationContainer: {
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default UserUpsertForm;
