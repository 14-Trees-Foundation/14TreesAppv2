// SiteEditModal.js
import { useContext, useEffect, useState} from 'react';
import { ScrollView ,View, Text, TextInput } from 'react-native';
import { Strings } from "../../services/Strings";
import { CustomButtonStyles, treeFormStyles } from "../../services/Styles";
import { Button } from 'react-native-paper';
import GlobalContext from '../../context/GlobalContext ';
import { CreateSiteRequest, Site } from '../../model/sites';

interface SiteFormInputProps {
    site: Site | null,
    changeMode: 'edit' | 'add'
    onCancel: () => void,
    onSubmit: (data: Site | CreateSiteRequest) => void
   
}

const SiteForm: React.FC<SiteFormInputProps> = ({ site, changeMode, onCancel, onSubmit }) => {

    const { lightTheme } = useContext(GlobalContext);
    const [name_marathi, setNameMarathi] = useState('');
    const [name_english, setNameEnglish] = useState('');
   
    useEffect(() => {
        if (site) {
          setNameMarathi(site.name_marathi);
          setNameEnglish(site.name_english);            
        }
    }, [site])

    const handleSubmit = () => {
        
        let data = {
            name_english: name_english,
            name_marathi: name_marathi,
        }

        if (changeMode === 'add') {
            const newSite = { ...data } as CreateSiteRequest;
            onSubmit(newSite)
        } else if (site) {
            let newChanges = { ...site, ...data } as Site;
            onSubmit(newChanges)
        }
    }

    return (
        <View style={{ height: "97%" }}>
            <Text style={treeFormStyles.plotSapling}> { changeMode === 'add' ? 'Add Site' : 'Edit Site' } </Text>
            <ScrollView
                keyboardShouldPersistTaps='handled'
                scrollEnabled={true}
                style={{ ...treeFormStyles.detailsContainerOuter, marginHorizontal: 0, }} >
                <View style={{ margin: 4, borderRadius: 10 }}>

                    <View style={{ marginTop: 15 }}>
                        <Text style={ treeFormStyles.inputLabel }>Name in english:</Text>
                        <TextInput
                            defaultValue={name_english}
                            style={treeFormStyles.textInput(lightTheme)}
                            placeholder={Strings.labels.SiteName}
                            placeholderTextColor={'black'}
                            onChangeText={(text) => { setNameEnglish(text) }}
                        />
                    </View>

                    <View style={{ marginTop: 15 }}>
                        <Text style={ treeFormStyles.inputLabel }>Name in marathi:</Text>
                        <TextInput
                            defaultValue={name_marathi}
                            style={treeFormStyles.textInput(lightTheme)}
                            placeholder={Strings.labels.SiteName}
                            placeholderTextColor={'black'}
                            onChangeText={(text) => { setNameMarathi(text) }}
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

export default SiteForm;
