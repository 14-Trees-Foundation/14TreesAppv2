// TreeEditModal.js
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import RCTDateTimePicker from '@react-native-community/datetimepicker';
import { CreateTreeRequest, Tree } from '../../model/tree';

interface TreeFormModalInputProps {
    mode: 'edit' | 'add'
    isVisible: boolean,
    onClose: () => void,
    onSave: (data: Tree | CreateTreeRequest) => void
    tree?: Tree
}

const TreeFormModal: React.FC<TreeFormModalInputProps> = ({ mode, isVisible, onClose, onSave, tree }) => {
   
    const [sapling_id, setsapling_id] = useState('');
    const [tree_type, settree_type] = useState('');
    const [image, setimage] = useState('');
    const [tree_location, settree_location] = useState("");

    useEffect(() => {
        if (tree) {
           
            setsapling_id(tree.sapling_id);
            settree_type(tree.tree_type);
            setimage(tree.image);
            settree_location(tree.tree_location);
        }
    }, [tree])

    const handleSubmit = () => {
        onClose();
        console.log(birthDate)
        let data: Tree | CreateTreeRequest = {
            sapling_id: sapling_id,
            tree_type: tree_type,
            image: image,
            tree_location: tree_location,
        }

        if (tree) {
            data = {
                ...tree,
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
                <Text style={styles.title}> {mode === 'add' ? 'Add' : 'Edit'} Tree Information</Text>

                <TextInput
                    style={styles.input}
                    value={sapling_id}
                    onChangeText={setsapling_id}
                    placeholder="Sapling Id"
                />
                <TextInput
                    style={styles.input}
                    value={tree_type}
                    onChangeText={settree_type}
                    placeholder="Tree Type"
                    keyboardType=""
                />
                <TextInput
                    style={styles.input}
                    value={image}
                    onChangeText={setimage}
                    placeholder="Image"
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

export default TreeFormModal;
