
import { useState } from 'react';
import { Text, TextInput, View, Modal, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CreateUserRequest } from '../../model/user';

interface AddUserInputProps {
    isOpen: boolean,
    handleClose: () => void,
    handleSubmit: (data: CreateUserRequest) => void
}

export const AddUser: React.FC<AddUserInputProps> = ({ isOpen, handleClose, handleSubmit }) => {

    const [formData, setFormData] = useState({
        'name': '',
        'phone': '',
        'email': '',
        'birth_date': ''
    })

    const handleChange = (key: string, value: string) => {
        setFormData({
            ...formData,
            [key]: value
        });
    }

    const validatePhone = (phone: string) => {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone);
      };
    
      const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };
    
      const handleFormSubmit = () => {
        if (!validatePhone(formData.phone)) {
          Alert.alert('Invalid phone number. It should be 10 digits.');
          return;
        }
        if (!validateEmail(formData.email)) {
          Alert.alert('Invalid email format.');
          return;
        }
    
        handleClose();
        handleSubmit({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            birth_date: formData.birth_date,
        });
      };

    return (
        <Modal visible={isOpen}>
            <View style={styles.modalContent}>
                <Text style={styles.title}>Add User</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Name"
                    value={formData.name}
                    onChangeText={value => {handleChange("name", value)}}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Phone"
                    value={formData.phone}
                    keyboardType="phone-pad"
                    onChangeText={value => {handleChange("phone", value)}}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={formData.email}
                    keyboardType="email-address"
                    onChangeText={value => {handleChange("email", value)}}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Birth Date (YYYY-MM-DD)"
                    value={formData.birth_date}
                    onChangeText={value => {handleChange("birth_date", value)}}
                />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={handleClose}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={handleFormSubmit}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        backgroundColor: '#2196F3',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default AddUser;
