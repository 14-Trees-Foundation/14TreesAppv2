import { View, BackHandler, ScrollView } from "react-native";
import { Strings } from '../services/Strings';
import React, { useContext, useEffect, useState } from "react";
import { shiftsStyles } from "../services/Styles";
import GlobalContext from "../context/GlobalContext ";
import { Button } from 'react-native-paper';
import { Iconstyles } from "../services/Styles";
import AddUser from "../components/user/AddUser";
import { UserClient } from "../services/api/users";
import { LocalDatabase } from "../services/db/db";

const Users = ({ navigation }) => {

    const { lightTheme } = useContext(GlobalContext);

    const [isAddModalVisible, setIsAddModalVisible] = useState(false);

    useEffect(() => {
        const backAction = () => {
            navigation.goBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    const apiClient = new UserClient();
    const localClient = new LocalDatabase();
    
    const handleSubmit = (data) => {
        // apiClient.createUser(data)
        localClient.users.createLocalUser(data);
    }

    return (
        <ScrollView keyboardShouldPersistTaps='handled' style={shiftsStyles.scrollView}>

            <View style={{ flex: 1, marginLeft: 22, marginTop: 24, marginBottom: 10, }}>
                <Button
                    mode="contained"
                    buttonColor='#059636'
                    onPress={() => {
                        setIsAddModalVisible(true); 
                    }}
                    style={{ width: "63%", borderRadius: 20 }}
                    contentStyle={Iconstyles.buttonContent}
                    labelStyle={{
                        ...Iconstyles.buttonLabel(lightTheme),
                    }}
                >
                    {Strings.buttonLabels.AddUser}

                </Button>
            </View>
            <AddUser
                isOpen={isAddModalVisible}
                handleClose={() => { setIsAddModalVisible(false) }}
                handleSubmit={handleSubmit}
            />
        </ScrollView >
    )
}

export default Users;

