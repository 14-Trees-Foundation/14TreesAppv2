import { useContext, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Strings } from "../../services/Strings";
import { CustomButtonStyles, treeFormStyles } from "../../services/Styles";
import GlobalContext from '../../context/GlobalContext ';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { User, CreateUserRequest } from '../../model/user';
import { DaoClient } from '../../services/db/dao';

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
    const [formError, setFormError] = useState({
        nameError: '',
        emailError: '',
        phoneError: '',
    })
    const [birthDate, setBirthDate] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setPhone(user.phone);
            setBirthDate(user.birth_date);
        }
    }, [user])

    const handleNameChange = (name: string) => {
        if (name.trim() === '') {
            setFormError(prev => ({ ...prev, nameError: 'Username is required!' }))
        } else {
            setFormError(prev => ({ ...prev, nameError: '' }))
        }
        setName(name);
    }

    const handleEmailChange = (email: string) => {
        email = email.trim();
        if (email === '') {
            setFormError(prev => ({ ...prev, emailError: 'User email is required!' }))
        } else if (!email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)) {
            setFormError(prev => ({ ...prev, emailError: 'Invalid email address!' }))
        } else {
            setFormError(prev => ({ ...prev, emailError: '' }))
        }
        setEmail(email);
    }

    const handlePhoneChange = (phone: string) => {
        phone = phone.trim();
        if (phone.trim() === '') {
            setFormError(prev => ({ ...prev, phoneError: 'Contact number is required!' }))
        } else if (!phone.match(/^[0-9]{10}$/)) {
            setFormError(prev => ({ ...prev, phoneError: 'Invalid contact number!' }))
        } else {
            setFormError(prev => ({ ...prev, phoneError: '' }))
        }
        setPhone(phone);
    }

    const checkIfEmailExists = async (email: string) => {
        const daoClient = await DaoClient.authenticate();
        const users = await daoClient.users.getUsersByEmail(email);
        if (users.length !== 0) {
            return true;
        }

        return false;
    }

    const handleSubmit = async () => {
        let hasError: boolean = Boolean(formError.nameError || formError.emailError || formError.phoneError);
        const data = {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            birth_date: birthDate
        }

        if (data.name === '') {
            setFormError(prev => ({ ...prev, nameError: 'Username is required!' }))
            hasError = true;
        }
        if (data.email === '') {
            setFormError(prev => ({ ...prev, emailError: 'Email is required!' }))
            hasError = true;
        }
        if (data.phone === '') {
            setFormError(prev => ({ ...prev, phoneError: 'Contact number is required!' }))
            hasError = true;
        }

        if (hasError) return;

        if (changeMode === 'add') {
            const emailExists = await checkIfEmailExists(data.email);
            if (emailExists) {
                setFormError(prev => ({ ...prev, emailError: 'Email already exists!' }))
                return;
            }
            const newUser = { ...data } as CreateUserRequest;
            onSubmit(newUser)
        } else if (user) {
            let newChanges = { ...user, ...data } as User;
            onSubmit(newChanges)
        }
    }

    return (
        <View style={{ height: "97%", width: '100%', flexGrow: 1 }}>
            <Text style={treeFormStyles.plotSapling}> {changeMode === 'add' ? 'Add User' : 'Edit User'} </Text>
            <ScrollView
                keyboardShouldPersistTaps='handled'
                scrollEnabled={true}
                style={{ ...treeFormStyles.detailsContainerOuter, marginHorizontal: 0, }} >
                <View style={{ margin: 4, borderRadius: 10 }}>
                    <View style={{ marginTop: 15, flexGrow: 1 }}>
                        <TextInput
                            defaultValue={name}
                            mode='outlined'
                            label={Strings.labels.Username}
                            onChangeText={handleNameChange}
                        />
                        {formError.nameError && <HelperText visible type='error'>{formError.nameError}</HelperText>}
                    </View>
                    <View style={{ marginTop: 15, flexGrow: 1 }}>
                        <TextInput
                            defaultValue={email}
                            mode='outlined'
                            label={Strings.labels.Email}
                            onChangeText={handleEmailChange}
                        />
                        {formError.emailError && <HelperText visible type='error'>{formError.emailError}</HelperText>}
                    </View>
                    <View style={{ marginTop: 15, flexGrow: 1 }}>
                        <TextInput
                            defaultValue={phone}
                            mode='outlined'
                            label={Strings.labels.Phone}
                            keyboardType='numeric'
                            onChangeText={handlePhoneChange}
                        />
                        {formError.phoneError && <HelperText visible type='error'>{formError.phoneError}</HelperText>}
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