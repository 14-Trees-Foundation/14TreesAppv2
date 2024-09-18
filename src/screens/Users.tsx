import { View, BackHandler, StyleSheet } from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import GlobalContext from "../context/GlobalContext ";

import { DaoClient } from "../services/db/dao";
import UserForm from "../components/user/UserForm";
import UserCard from "../components/user/UserCard";
import UserInfo from "../components/user/UserInfo";
import { TouchableOpacity } from "react-native";
import { CreateUserRequest, User } from "../model/user";
import { useFocusEffect } from "@react-navigation/native";
import { AddIconButton } from "../components/FABplusIcon";
import SearchBar from "../components/Searchbar";
import InternetBanner from "../components/InternetInfo";
import CardList from "../components/CardList";

interface UsersInputProps {
    navigation: any
}

const Users: React.FC<UsersInputProps> = ({ navigation }) => {

    const { langChanged } = useContext(GlobalContext);
    useEffect(() => {
        console.log('langChanged inside Users: ', langChanged);
    }, [langChanged]);
    const [stateChange, setStateChange] = useState(0);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isInfoModalVisible, setInfoModalVisible] = useState(false);
    const [changeMode, setChangeModel] = useState<'add' | 'edit'>('add');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [usersPage, setUsersPage] = useState(0);
    const [hasMoreUsers, setHasMoreUsers] = useState(true);

    useFocusEffect(
        useCallback(() => {
            setIsFormVisible(false);
            setStateChange(prev => prev + 1);
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
        const getUsers = async () => {
            const daoClient = await DaoClient.authenticate();
            let resp = await daoClient.users.searchUsers(searchQuery, usersPage * 10, 10);
            const newUsers = usersPage === 0 ? resp : [...users, ...resp];
    
            // Filter out duplicates based on user.id
            const uniqueUsers = newUsers.filter((user, index, self) => 
                index === self.findIndex((t) => t.id === user.id)
            );
    
            setUsers(uniqueUsers);
            setHasMoreUsers(resp.length === 10);
        }
        
        getUsers();
    }, [usersPage, searchQuery, stateChange])

    useEffect(() => {
        if (searchQuery.length > 0) return;
        const getUsers = async () => {
            const daoClient = await DaoClient.authenticate();
            let resp = await daoClient.users.getUsers(usersPage * 10, 10);
            const newUsers = usersPage === 0 ? resp : [...users, ...resp];
    
            // Filter out duplicates based on user.id
            const uniqueUsers = newUsers.filter((user, index, self) => 
                index === self.findIndex((t) => t.id === user.id)
            );
    
            setUsers(uniqueUsers);
            setHasMoreUsers(resp.length === 10);
        }

        getUsers();
    }, [usersPage, searchQuery, stateChange])

    const handleSave = (data: User | CreateUserRequest) => {
        setIsFormVisible(false);

        const saveUser = async () => {
            const daoClient = await DaoClient.authenticate();
            if (changeMode === 'add') {
                let request = JSON.parse(JSON.stringify(data)) as CreateUserRequest;
                await daoClient.users.createUser(request)
            } else {
                let request = JSON.parse(JSON.stringify(data)) as User;
                await daoClient.users.updateUser(request)
            };
    
            setStateChange(prev => prev + 1);
        }

        saveUser();
    };

    const handleDelete = () => {

        const deleteUser = async () => {
            if (selectedUser) {
                const daoClient = await DaoClient.authenticate();
                await daoClient.users.deleteUser(selectedUser.local_id);
                setStateChange(prev => prev + 1);
            }
        }

        deleteUser();
    }

    const renderUserItem = (user: User, index: number) => {
        return (
            <View style={{ width: '100%', paddingHorizontal: 10 }}>
                <TouchableOpacity 
                    style={{ width: '100%' }} 
                    activeOpacity={0.9} 
                    onPress={() => {
                        setSelectedUser(user);
                        setInfoModalVisible(true);
                    }}
                >
                    <UserCard user={user} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <InternetBanner />
            <View style={styles.safeArea}>
                {!isFormVisible && <View style={styles.header}>
                    <SearchBar query={searchQuery} onChange={(text: string) => { setUsersPage(0); setSearchQuery(text) } } />
                </View>}
                {!isFormVisible && <CardList 
                    data={users}
                    renderItem={renderUserItem}
                    pagination
                    onEndReached={() => setUsersPage(usersPage + 1)}
                    hasMore={hasMoreUsers}
                />}
                {!isFormVisible && <AddIconButton onClick={() => {
                    setIsFormVisible(true);
                    setSelectedUser(null);
                    setChangeModel('add');
                }} />}

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
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 10,
        height: 50,
        width: '95%'
    },
    scrollView: {
        flex: 1,
        width: '100%'
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
});

export default Users;