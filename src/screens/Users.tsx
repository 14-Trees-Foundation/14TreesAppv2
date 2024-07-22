import { View, Button, BackHandler, ScrollView, SafeAreaView, StyleSheet, TextInput, Text } from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import GlobalContext from "../context/GlobalContext ";

import { DaoClient } from "../services/db/dao";
import UserForm from "../components/user/UserForm";
import UserCard from "../components/user/UserCard";
import UserInfo from "../components/user/UserInfo";
import { TouchableOpacity } from "react-native";
import { CreateUserRequest, User } from "../model/user";
import { useFocusEffect } from "@react-navigation/native";

interface UsersInputProps {
    navigation: any
}

const Users: React.FC<UsersInputProps> = ({ navigation }) => {

    const { lightTheme } = useContext(GlobalContext);
    const [stateChange, setStateChange] = useState(0);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isInfoModalVisible, setInfoModalVisible] = useState(false);
    const [changeMode, setChangeModel] = useState<'add' | 'edit'>('add');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);

    let daoClient: DaoClient;
    DaoClient.authenticate().then((client) => { daoClient = client; });

    useFocusEffect(
        useCallback(() => {
          setIsFormVisible(false);
          setStateChange(stateChange + 1);
          return () => {
          };
        }, [])
    );

    useEffect(() => {
        const backAction = () => {
            navigation.goBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        if (searchQuery.length < 1) return;
        setTimeout(async () => {
            let users = await daoClient.users.searchUsers(searchQuery, 0, 100);
            setUsers(users);
        }, 1000)
    }, [searchQuery, stateChange])
    
    useEffect(() => {
        if (searchQuery.length > 0) return;
        setTimeout(async () => {
            let users = await daoClient.users.getUsers(0, 100);
            setUsers(users);
        }, 1000)
    }, [searchQuery, stateChange])

    const handleSave = (data: User | CreateUserRequest) => {
        setIsFormVisible(false);
        setTimeout(async () => {

            if (changeMode === 'add') {
                let request = JSON.parse(JSON.stringify(data)) as CreateUserRequest;
                await daoClient.users.createUser(request)
            } else {
                let request = JSON.parse(JSON.stringify(data)) as User;
                await daoClient.users.updateUser(request)
            };

            setStateChange(stateChange + 1);
        }, 1000)
    };

    const handleDelete = () => {
        if (selectedUser) {
            setTimeout(async () => {
                await daoClient.users.deleteUser(selectedUser.local_id);
                setStateChange(stateChange + 1);
            }, 1000)
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {!isFormVisible && <View style={styles.header}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search"
                    placeholderTextColor={'black'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <View style={styles.buttonAdd}>
                    <Button title="Add" onPress={() => {
                        setIsFormVisible(true);
                        setSelectedUser(null);
                        setChangeModel('add');
                    }} />
                </View>
            </View>}
            {!isFormVisible && <ScrollView style={styles.scrollView} >
                {users.map((user, index) => (
                    <TouchableOpacity style={{ width: '100%', alignItems: 'center' }} activeOpacity={0.5} key={index} onPress={() => {
                        setSelectedUser(user);
                        setInfoModalVisible(true);
                    }}>
                        <UserCard 
                            user={user}
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>}

            {isFormVisible && <UserForm
                changeMode={changeMode}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleSave}
                user={selectedUser}
            />}

            {selectedUser && <UserInfo
                isVisible={isInfoModalVisible}
                onClose={() => { setInfoModalVisible(false) }}
                onEdit={() => { setChangeModel('edit'); setIsFormVisible(true); }}
                onDelete={handleDelete}
                user={selectedUser}
            />}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        alignItems: 'center'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        width: '95%'
    },
    searchInput: {
        flex: 1,
        width: '80%',
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        marginRight: 10,
        color: 'black'
    },
    buttonAdd: {
        width: '20%',
        height: '100%',
        justifyContent: 'center'
    },
    scrollView: {
        flex: 1,
        width: '95%'
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
});

export default Users;