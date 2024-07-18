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
    const [visit_name, setName] = useState('');
    const [visit_date, setDate] = useState('');
    const [site_id, setSiteId] = useState('');
   

    useEffect(() => {
        if (visit) {
            setName(visit.visit_name);
            setDate(visit.visit_date);
            setSiteId(visit.site_id);
           
        }
    }, [visit])

    // useEffect(() => {
    //     setTimeout(async () => {
    //         try {
    //             const userData = await AsyncStorage.getItem(Constants.userDetailsKey)
    //             if (userData) setUserDetails(JSON.parse(userData));
    //             let { userTypes, plots } = await Utils.getLocalUserTypesAndPlots();
    //         } catch (error: any) {
    //             console.error(error);
    //             const stackTrace = error.stack;
    //             const errorLog = {
    //                 msg: 'happened while trying to fetch user details from local db(loadDataCallback())',
    //                 error: JSON.stringify(error),
    //                 stackTrace: stackTrace,
    //             };
    
    //             await Utils.logException(JSON.stringify(errorLog));
    //         }
    //     }, 1000);
    // }, []);

    const handleSubmit = () => {
        const data = {
            visit_name: visit_name,
            visit_date: visit_date,
            site_id: site_id,
           
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
                        <Text style={ treeFormStyles.inputLabel }>Enter visit name:</Text>
                        <TextInput
                            defaultValue={visit_name}
                            style={treeFormStyles.textInput(lightTheme)}
                            placeholder={Strings.labels.SaplingId}
                            placeholderTextColor={'black'}
                            onChangeText={(text) => { setName(text) }}
                        />
                    </View>

                    <View >
                        <Text style={ treeFormStyles.inputLabel }>Enter visit date:</Text>
                        <View style={{ flexGrow: 1 }}>
                            <TextInput
                                defaultValue={email}
                                style={treeFormStyles.textInput(lightTheme)}
                                placeholder={Strings.labels.SaplingId}
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