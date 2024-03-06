import { Strings } from '../services/Strings';
import HomeScreen from '../screens/Home';
import AddTreeScreen from '../screens/AddTree';
import EditTreeScreen from '../screens/EditTree';
import VerifyusersScreen from '../screens/VerifyUsers';
import { stackNavRef } from '../App';
import { LocalDataNavigator } from './LocalDataNavigator';
import LangContext from "../context/LangContext ";
import { commonStyles } from "../services/Styles";
import { styleConfigs } from "../services/Styles";
import { useState, useEffect, useCallback, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { TouchableOpacity, View, Image, Text, BackHandler, Alert } from "react-native";
import { Constants, Utils, getImageSourceObject, logoSrc } from "../services/Utils";
import { DrawerContentScrollView, DrawerItemList, createDrawerNavigator, } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import About from '../screens/About';

const Drawer = createDrawerNavigator();

const fillInUserDetails = async (setIsAdmin, setUserDetails) => {
    let storedUserDetails = await AsyncStorage.getItem(Constants.userDetailsKey);
    if (storedUserDetails) {
        storedUserDetails = JSON.parse(storedUserDetails);
        setUserDetails(storedUserDetails);
        if (storedUserDetails.adminID) {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    }
};

const logout = async navigationRef => {
    await AsyncStorage.removeItem(Constants.adminIdKey);
    await AsyncStorage.removeItem(Constants.userIdKey);
    await AsyncStorage.removeItem(Constants.userDetailsKey);
    navigationRef.current?.navigate(
        Strings.screenNames.getString('LogIn', Strings.english),
    );
};

const DrawerContent = (props) => {
    let { isAdmin, userDetails } = props;

    return (
        <DrawerContentScrollView {...props}>
            <View
                style={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: 50,
                    bottom: 0,
                }}>
                <Image
                    source={Constants.logoImage()} // Replace with your delete icon image
                    style={{ width: 100, height: 100, marginLeft: 10 }} // Adjust the icon dimensions and margin
                />
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black' }}>
                    14 Trees
                </Text>
                {userDetails ? (
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            alignSelf: 'flex-start',
                            margin: 10,
                            justifyContent: 'space-around',
                        }}>
                        <Image
                            source={getImageSourceObject(userDetails.image)}
                            style={{ width: 75, height: 75, borderRadius: 37.5 }}></Image>
                        <View style={{ flexDirection: 'column', marginLeft: 5 }}>
                            <View style={{ width: 160 }}>
                                <Text style={{ fontSize: 20, color: 'black' }}>
                                    {userDetails.name}
                                </Text>
                            </View>
                            <Text style={{ fontSize: 16, color: "green" }}>
                                {isAdmin ? Strings.labels.admin : Strings.labels.logger}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <Text>Loading user details...</Text>
                )}
            </View>
            <DrawerItemList {...props} />
            <View
                style={{
                    flexDirection: 'column',
                    position: 'relative',
                    marginTop: 100,
                    alignSelf: 'center',
                }}>
                <TouchableOpacity
                    style={{ ...commonStyles.logOutButton }}
                    onPress={() => Utils.confirmAction(() => logout(props.navigationRef), undefined, Strings.messages.logoutConfirm)}>
                    <Text style={{ color: 'white', fontSize: 18 }}>
                        {Strings.buttonLabels.logOut}
                    </Text>
                </TouchableOpacity>
            </View>
        </DrawerContentScrollView>
    );
};

export const DrawerNavigator = ({ navigation, route }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const navigationRef = stackNavRef;
    const [userDetails, setUserDetails] = useState(null);
    const { langChanged } = useContext(LangContext);

    useEffect(() => {

        const backAction = () => {
            console.log("exiting from drawerScreen-------");
            BackHandler.exitApp();
            return true; // Prevent default behavior (exit app)
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, [])

    useEffect(() => {
        console.log("langChanged inside DrawerNavigator: ", langChanged);
    }, [langChanged]);

    useFocusEffect(
        useCallback(() => {
            console.log('in focus');
            fillInUserDetails(setIsAdmin, setUserDetails);
        }, [fillInUserDetails]),
    );

    return (
        <Drawer.Navigator
            drawerContent={props => (
                <DrawerContent
                    userDetails={userDetails}
                    isAdmin={isAdmin}
                    navigationRef={navigationRef}
                    {...props}
                />
            )}>
            <Drawer.Screen
                name={Strings.screenNames.getString('HomePage', Strings.english)}
                component={HomeScreen}
                options={{
                    ...styleConfigs.drawerHeaderOptions,
                    title: Strings.screenNames.HomePage,
                }}
            />
            <Drawer.Screen
                name={Strings.screenNames.getString(
                    'LocalDataNavigator',
                    Strings.english,
                )}
                component={LocalDataNavigator}
                options={{
                    ...styleConfigs.drawerHeaderOptions,
                    title: Strings.screenNames.LocalDataView,
                }}
            />
            <Drawer.Screen
                name={Strings.screenNames.getString('AddTree', Strings.english)}
                component={AddTreeScreen}
                options={{
                    ...styleConfigs.drawerHeaderOptions,
                    title: Strings.screenNames.AddTree,
                }}
            />
            {isAdmin && (
                <Drawer.Screen
                    name={Strings.screenNames.getString('EditTree', Strings.english)}
                    component={EditTreeScreen}
                    options={{
                        ...styleConfigs.drawerHeaderOptions,
                        title: Strings.screenNames.EditTree,
                    }}
                />
            )}
            {isAdmin && (
                <Drawer.Screen
                    name={Strings.screenNames.getString('VerifyUsers', Strings.english)}
                    component={VerifyusersScreen}
                    options={{
                        ...styleConfigs.drawerHeaderOptions,
                        title: Strings.screenNames.VerifyUsers,
                    }}
                />
            )}
            <Drawer.Screen
                name={Strings.screenNames.getString('AppInfo', Strings.english)}
                component={About}
                options={{
                    ...styleConfigs.drawerHeaderOptions,
                    title: Strings.screenNames.AppInfo,
                }}
            />
        
        </Drawer.Navigator >
    );
};