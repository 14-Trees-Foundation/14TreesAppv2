// SiteEditModal.js
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import RCTDateTimePicker from '@react-native-community/datetimepicker';
import { CreateSiteRequest, Sites } from '../../model/sites';

interface SiteFormModalInputProps {
    mode: 'edit' | 'add'
    isVisible: boolean,
    onClose: () => void,
    onSave: (data: Sites | CreateSiteRequest) => void
    site?: Sites
}

const SiteFormModal: React.FC<SiteFormModalInputProps> = ({ mode, isVisible, onClose, onSave, site }) => {
    const date = new Date();
    const [name_marathi, setNameMarathi] = useState('');
    const [name_english, setNameEnglish] = useState('');
   

    useEffect(() => {
        if (site) {
          setNameMarathi(site.name_marathi);
          setNameEnglish(site.name_english);
            
            
        }
    }, [site])

    const handleSubmit = () => {
        onClose();
        let data: Sites | CreateSiteRequest = {
            name_english: name_english,
            name_marathi: name_marathi,
           
        }

        if (site) {
            data = {
                ...site,
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
                <Text style={styles.title}> {mode === 'add' ? 'Add' : 'Edit'} Site Information</Text>

                <TextInput
                    style={styles.input}
                    value={name_english}
                    onChangeText={setNameEnglish}
                    placeholder="Name English"
                />
                <TextInput
                    style={styles.input}
                    value={name_marathi}
                    onChangeText={setNameMarathi}
                    placeholder="Name Marathi"
                    keyboardType=""
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

export default SiteFormModal;
