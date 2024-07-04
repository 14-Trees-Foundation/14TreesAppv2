// UserEditModal.js
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import RCTDateTimePicker from '@react-native-community/datetimepicker';
import { CreateUserRequest, User } from '../../model/user';

interface UserFormModalInputProps {
    mode: 'edit' | 'add'
    isVisible: boolean,
    onClose: () => void,
    onSave: (data: User | CreateUserRequest) => void
    user?: User
}

const UserFormModal: React.FC<UserFormModalInputProps> = ({ mode, isVisible, onClose, onSave, user }) => {
    const date = new Date();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState(date);

    useEffect(() => {
        if (user) {
            const date = user.birth_date ? new Date(user.birth_date) : new Date();
            setName(user.name);
            setEmail(user.email);
            setPhone(user.phone);
            setBirthDate(date);
        }
    }, [user])

    const handleSubmit = () => {
        onClose();
        console.log(birthDate)
        let data: User | CreateUserRequest = {
            name: name,
            email: email,
            phone: phone,
            birth_date: birthDate?.toISOString() ?? '',
        }

        if (user) {
            data = {
                ...user,
                ...data
            }
        }
        onSave(data);
    }
     return (
        <Modal
            isVisible={isVisible}
            backdropColor="black"
            backdropOpacity={0.5}
            style={styles.modal}
            onBackdropPress={onClose}
        >
            <View style={styles.modalContainer}>
                <Text style={styles.title}> {mode === 'add' ? 'Add' : 'Edit'} User Information</Text>

                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Name"
                />
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Phone"
                    keyboardType="phone-pad"
                />

                <View style={styles.buttonContainer}>
                    <View style={styles.buttonCancel}>
                        <Button title="Cancel" onPress={onClose} />
                    </View>
                    <View style={styles.buttonSave}>
                        <Button title="Save" onPress={handleSubmit} />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
    },
    datePicker: {
        width: '100%',
        marginBottom: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonSave: {
        margin: 5,
        color: "green"
    },
    buttonCancel: {
        margin: 5,
        color: "red"
    },
});

export default UserFormModal;
