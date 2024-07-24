import { useContext, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Strings } from "../../services/Strings";
import { CustomButtonStyles, treeFormStyles } from "../../services/Styles";
import GlobalContext from '../../context/GlobalContext ';
import { Button, TextInput } from 'react-native-paper';
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
        <View style={{ height: "97%", width: '100%', flexGrow: 1 }}>
            <Text style={treeFormStyles.plotSapling}> { changeMode === 'add' ? 'Add User' : 'Edit User' } </Text>
            <ScrollView
                keyboardShouldPersistTaps='handled'
                scrollEnabled={true}
                style={{ ...treeFormStyles.detailsContainerOuter, marginHorizontal: 0, }} >
                <View style={{ margin: 4, borderRadius: 10 }}>
                    <View style={{ marginTop: 15, flexGrow: 1 }}>
                        <TextInput
                            defaultValue={name}
                            mode='flat'
                            label={Strings.labels.Username}
                            onChangeText={(text) => { setName(text) }}
                        />
                    </View>
                    <View style={{ marginTop: 15, flexGrow: 1 }}>
                        <TextInput
                            defaultValue={email}
                            mode='flat'
                            label={Strings.labels.Email}
                            onChangeText={(text) => { setEmail(text) }}
                        />
                    </View>
                    <View style={{ marginTop: 15, flexGrow: 1 }}>
                        <TextInput
                            defaultValue={phone}
                            mode='flat'
                            label={Strings.labels.Phone}
                            onChangeText={(text) => { setPhone(text) }}
                        />
                    </View>


                    <View style={CustomButtonStyles.container}>
                        <View style={CustomButtonStyles.buttonRow}>
                            <View style={CustomButtonStyles.buttonContainer}>
                                <Button
                                    mode="elevated"
                                    buttonColor='#FF6666'
                                    labelStyle={CustomButtonStyles.buttonLabel}
                                    style={CustomButtonStyles.button}
                                    onPress={onCancel}
                                >
                                    {Strings.buttonLabels.cancel}
                                </Button>
                            </View>
                            <View style={CustomButtonStyles.buttonContainer}>
                                <Button
                                    mode='elevated'
                                    onPress={handleSubmit}
                                    buttonColor='#4CAF50'
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