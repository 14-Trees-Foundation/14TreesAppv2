// PLotsEditModal.js
import React, { useContext, useEffect, useState} from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { CreatePlotRequest, Plot } from '../../model/plot';
import { Button } from 'react-native-paper';
import { CustomButtonStyles, treeFormStyles } from '../../services/Styles';
import { ScrollView } from 'react-native';
import GlobalContext from '../../context/GlobalContext ';
import { Strings } from '../../services/Strings';
import { NewCustomDropdown } from '../NewCustomDropdown';

interface PlotFormInputProps {
    plot: Plot | null,
    changeMode: 'add' | 'edit',
    onSubmit: (data: Plot | CreatePlotRequest, image?: any) => void,
    onCancel: () => void,
}

const PlotForm: React.FC<PlotFormInputProps> = ({ plot, changeMode, onCancel, onSubmit }) => {

    const { lightTheme } = useContext(GlobalContext);

    const categoryList = [
        'Public',
        'Foundation'
    ]

    const [name, setName] = useState('');
    const [plotId, setPlotId] = useState('');
    const [tags, setTags] = useState<string[] | null>(null);
    const [category , setCategory] = useState<string | null>(null);
    const [gat, setGat] = useState<string | null>(null);
    

    useEffect(() => {
        if (plot) {
            setName(plot.name);
            setPlotId(plot.plot_id);
            setTags(plot.tags ? plot.tags.split(',') : null);
            setGat(plot.gat);
            setCategory(plot.category);
            setGat(plot.gat);
        }
    }, [plot])

    const handleSubmit = () => {        
        let data = {
            name: name,
            plot_id: plotId,
            tags: tags ? tags.join(',') : null,
            gat: gat,
            category: category,
        }

        if (changeMode === 'add') {
            const newPlot = { ...data } as CreatePlotRequest;
            onSubmit(newPlot)
        } else if (plot) {
            let newChanges = { ...plot, ...data } as Plot;
            onSubmit(newChanges)
        }
    }

    return (
        <View style={{ height: "97%" }}>
            <Text style={treeFormStyles.plotSapling}> { changeMode === 'add' ? 'Add Plot' : 'Edit Plot' } </Text>
            <ScrollView
                keyboardShouldPersistTaps='handled'
                scrollEnabled={true}
                style={{ ...treeFormStyles.detailsContainerOuter, marginHorizontal: 0, }} >
                <View style={{ margin: 4, borderRadius: 10 }}>

                    <View style={{ marginTop: 15 }}>
                        <Text style={ treeFormStyles.inputLabel }>{Strings.labels.PlotName}:</Text>
                        <TextInput
                            defaultValue={name}
                            style={treeFormStyles.textInput(lightTheme)}
                            placeholder={Strings.labels.PlotName}
                            placeholderTextColor={'black'}
                            onChangeText={(text) => { setName(text) }}
                        />
                    </View>
                    <View style={{ marginTop: 15 }}>
                        <Text style={ treeFormStyles.inputLabel }>{Strings.labels.PlotId}:</Text>
                        <TextInput
                            defaultValue={plotId}
                            style={treeFormStyles.textInput(lightTheme)}
                            placeholder={Strings.labels.PlotId}
                            placeholderTextColor={'black'}
                            onChangeText={(text) => { setPlotId(text) }}
                        />
                    </View>
                    <View>
                        <Text style={ treeFormStyles.inputLabel }>{Strings.labels.PlotCategory}:</Text>
                        <View style={{ paddingLeft: 12, alignItems: 'center', width: '96%' }}>
                            <NewCustomDropdown
                                value={category}
                                options={categoryList}
                                label={Strings.labels.PlotCategory}
                                onChange={(data) => { setCategory(data); }}
                                valueGetter={(data) => data || ''}
                                keyGetter={(data) => data || ''}
                            />
                        </View>
                    </View>
                    <View style={{ marginTop: 15 }}>
                        <Text style={ treeFormStyles.inputLabel }>{Strings.labels.Tags}:</Text>
                        <TextInput
                            defaultValue={tags?.join(',') || ''}
                            style={treeFormStyles.textInput(lightTheme)}
                            placeholder={Strings.labels.Tags}
                            placeholderTextColor={'black'}
                            onChangeText={(text) => { setTags(text.split(',')) }}
                        />
                    </View>
                    <View style={{ marginTop: 15 }}>
                        <Text style={ treeFormStyles.inputLabel }>{Strings.labels.Gat}:</Text>
                        <TextInput
                            defaultValue={gat || ''}
                            style={treeFormStyles.textInput(lightTheme)}
                            placeholder={Strings.labels.Gat}
                            placeholderTextColor={'black'}
                            onChangeText={(text) => { setGat(text) }}
                        />
                    </View>

                    <View style={CustomButtonStyles.container}>
                        <View style={CustomButtonStyles.buttonRow}>
                            <View style={CustomButtonStyles.buttonContainer}>
                                {
                                    <Button
                                        mode="contained"
                                        buttonColor='red'
                                        labelStyle={CustomButtonStyles.buttonLabel}
                                        style={CustomButtonStyles.button}
                                        onPress={onCancel}
                                    >
                                        {Strings.buttonLabels.cancel}
                                    </Button>
                                }
                            </View>
                            <View style={CustomButtonStyles.buttonContainer}>
                                <Button
                                    onPress={handleSubmit}
                                    buttonColor='#1D4ED8'
                                    labelStyle={CustomButtonStyles.buttonLabel}
                                    style={CustomButtonStyles.button}
                                >
                                    {Strings.buttonLabels.Submit}
                                </Button>
                            </View>
                        </View>
                    </View>

                </View>
            </ScrollView>
        </View>
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

export default PlotForm;
