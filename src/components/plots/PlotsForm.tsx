// PLotsEditModal.js
import React, { useEffect, useState , useContext} from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { Strings } from "../../services/Strings";
import { CustomButtonStyles, treeFormStyles } from "../../services/Styles";
import GlobalContext from '../../context/GlobalContext ';
import RCTDateTimePicker from '@react-native-community/datetimepicker';
import { CreatePlotRequest, Plots } from '../../model/plots';

interface PlotsFormInputProps {
    mode: 'edit' | 'add'
    isVisible: boolean,
    onSubmit: (data: Plots | CreatePlotRequest) => void,
    onCancel: () => void,
}

const PlotsForm: React.FC<PlotsFormInputProps> = ({ plot, changeMode, onCancel, onSubmit }) => {
    const date = new Date();
    const [name, setName] = useState('');
    const [plot_id, setPlotId] = useState('');
    const [tags, setTags] = useState('');
    const [land_type , setLandType] = useState("");
    const [gat, setGat] = useState('');
    const [site_id, setSiteId] = useState('');
    

    useEffect(() => {
        if (plot) {
            
            setName(plot.name);
            setPlotId(plot.plot_id);
            setTags(plot.tags);
            setGat(plot.gat);
            setLandType(plot.land_type);
            setSiteId(plot.site_id);
        }
    }, [plot])

    const handleSubmit = () => {
        onClose();
        
        let data = {
            name: name,
            plot_id: plot_id,
            tags: tags,
            gat: gat,
            land_type: land_type,
            site_id: site_id

            
        }

        if (changeMode === 'add') {
            const newPlot = { ...data } as CreatePlotRequest;
            onSubmit(newPlot)
        } else if (plot) {
            let newChanges = { ...plot, ...data } as Plots;
            onSubmit(newChanges)
        }
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
                <Text style={styles.title}> {mode === 'add' ? 'Add' : 'Edit'} Plot Information</Text>

                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Name"
                />
                <TextInput
                    style={styles.input}
                    value={plot_id}
                    onChangeText={setPlotId}
                    placeholder="Plot Id"
                    keyboardType=""
                />
                <TextInput
                    style={styles.input}
                    value={land_type}
                    onChangeText={setLandType}
                    placeholder="Land Type"
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

export default PlotsForm;
