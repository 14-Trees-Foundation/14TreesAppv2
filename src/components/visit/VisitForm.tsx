import { useContext, useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { Strings } from "../../services/Strings";
import { CustomButtonStyles, treeFormStyles } from "../../services/Styles";
import GlobalContext from '../../context/GlobalContext ';
import { Button } from 'react-native-paper';
import { Visit, CreateVisitRequest } from '../../model/visits';

interface VisitFormInputProps {
    visit: Visit | null,
    changeMode: 'add' | 'edit',
    onSubmit: (data: Visit | CreateVisitRequest) => void,
    onCancel: () => void,
}

const VisitForm: React.FC<VisitFormInputProps> = ({ visit, changeMode, onCancel, onSubmit }) => {

    const { lightTheme } = useContext(GlobalContext);
    const [visitName, setName] = useState('');
    const [visitDate, setDate] = useState('');
    const [siteId, setSiteId] = useState<number | null>(null);
    const [visitType, setVisitType] = useState<string>('');
   

    useEffect(() => {
        if (visit) {
            setName(visit.visit_name);
            setDate(visit.visit_date);
            setSiteId(visit.site_id);
            setVisitType(visit.visit_type);
        }
    }, [visit])

    const handleSubmit = () => {
        const data = {
            visit_name: visitName,
            visit_date: visitDate,
            site_id: siteId,
            visit_type: visitType,
        }

        if (changeMode === 'add') {
            const newVisit = { ...data } as CreateVisitRequest;
            onSubmit(newVisit)
        } else if (visit) {
            let newChanges = { ...visit, ...data } as Visit;
            onSubmit(newChanges)
        }
    }

    return (
        <View style={{ height: "97%", width: '100%', flexGrow: 1 }}>
            <Text style={treeFormStyles.plotSapling}> { changeMode === 'add' ? 'Add Visit' : 'Edit Visit' } </Text>
            <ScrollView
                keyboardShouldPersistTaps='handled'
                scrollEnabled={true}
                style={{ ...treeFormStyles.detailsContainerOuter, marginHorizontal: 0, }} >
                <View style={{ margin: 4, borderRadius: 10 }}>
                    <View style={{ marginTop: 15, flexGrow: 1 }}>
                        <Text style={ treeFormStyles.inputLabel }>{Strings.labels.VisitName}:</Text>
                        <TextInput
                            defaultValue={visitName}
                            style={treeFormStyles.textInput(lightTheme)}
                            placeholder={Strings.labels.VisitName}
                            placeholderTextColor={'black'}
                            onChangeText={(text) => { setName(text) }}
                        />
                    </View>
                    <View style={{ marginTop: 15, flexGrow: 1 }}>
                        <Text style={ treeFormStyles.inputLabel }>{Strings.labels.VisitType}:</Text>
                        <TextInput
                            defaultValue={visitType}
                            style={treeFormStyles.textInput(lightTheme)}
                            placeholder={Strings.labels.VisitType}
                            placeholderTextColor={'black'}
                            onChangeText={(text) => { setVisitType(text) }}
                        />
                    </View>

                    <View >
                        <Text style={ treeFormStyles.inputLabel }>{Strings.labels.VisitDate}:</Text>
                        <View style={{ flexGrow: 1 }}>
                            <TextInput
                                defaultValue={visitDate}
                                style={treeFormStyles.textInput(lightTheme)}
                                placeholder={Strings.labels.VisitDate}
                                placeholderTextColor={'black'}
                                onChangeText={(text) => { setDate(text) }}
                            />
                        </View>
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
}

export default VisitForm;