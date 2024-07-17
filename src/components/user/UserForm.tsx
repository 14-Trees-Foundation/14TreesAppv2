import { useContext, useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { Strings } from "../../services/Strings";
import { CustomButtonStyles, treeFormStyles } from "../../services/Styles";
import GlobalContext from '../../context/GlobalContext ';
import { Button } from 'react-native-paper';
import { User, CreateUserRequest } from '../../model/user';

interface UserFormInputProps {
    user: User | null,
    changeMode: 'add' | 'edit',
    onSubmit: (data: User | CreateUserRequest) => void,
    onCancel: () => void,
}

const UserForm: React.FC<UserFormInputProps> = ({ user, changeMode, onCancel, onSubmit }) => {

    const { lightTheme } = useContext(GlobalContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setPhone(user.phone);
            setBirthDate(user.birth_date);
        }
    }, [user])

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
            name: name,
            email: email,
            phone: phone,
            birth_date: birthDate
        }

        if (changeMode === 'add') {
            const newUser = { ...data } as CreateUserRequest;
            onSubmit(newUser)
        } else if (user) {
            let newChanges = { ...user, ...data } as User;
            onSubmit(newChanges)
        }
    }

    return (
        <View style={{ height: "97%" }}>
            <Text style={treeFormStyles.plotSapling}> { changeMode === 'add' ? 'Add User' : 'Edit User' } </Text>
            <ScrollView
                keyboardShouldPersistTaps='handled'
                scrollEnabled={true}
                style={{ ...treeFormStyles.detailsContainerOuter, marginHorizontal: 0, }} >
                <View style={{ margin: 4, borderRadius: 10 }}>
                    <View style={{ marginTop: 15 }}>
                        <Text style={ treeFormStyles.inputLabel }>Enter full name:</Text>
                        <TextInput
                            defaultValue={name}
                            style={treeFormStyles.textInput(lightTheme)}
                            placeholder={Strings.labels.SaplingId}
                            placeholderTextColor={'black'}
                            onChangeText={(text) => { setName(text) }}
                        />
                    </View>

                    <View>
                        <Text style={ treeFormStyles.inputLabel }>Enter email address:</Text>
                        <View style={{ paddingLeft: 12, alignItems: 'center', width: '96%' }}>
                            <TextInput
                                defaultValue={email}
                                style={treeFormStyles.textInput(lightTheme)}
                                placeholder={Strings.labels.SaplingId}
                                placeholderTextColor={'black'}
                                onChangeText={(text) => { setEmail(text) }}
                            />
                        </View>
                    </View>
                    <View>
                        <Text style={ treeFormStyles.inputLabel }>Enter mobile number:</Text>
                        <View style={{ paddingLeft: 12, alignItems: 'center', width: '96%' }}>
                            <TextInput
                                defaultValue={phone}
                                style={treeFormStyles.textInput(lightTheme)}
                                placeholder={Strings.labels.SaplingId}
                                placeholderTextColor={'black'}
                                onChangeText={(text) => { setPhone(text) }}
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

export default UserForm;