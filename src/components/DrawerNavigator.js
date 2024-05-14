import { Strings } from '../services/Strings';
import HomeScreen from '../screens/Home';
import EditTreeScreen from '../screens/EditTree';
import VerifyusersScreen from '../screens/VerifyUsers';
import { stackNavRef } from '../App';
import GlobalContext from "../context/GlobalContext ";
import { commonStyles } from "../services/Styles";
import { styleConfigs } from "../services/Styles";
import { useState, useEffect, useCallback, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { TouchableOpacity, View, Image, Text, BackHandler, Alert } from "react-native";
import { Constants, Utils, getImageSourceObject, logoSrc } from "../services/Utils";
import { DrawerContentScrollView, DrawerItemList, createDrawerNavigator, } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import About from '../screens/About';
import Shifts from "../screens/Shifts";
import ScreenHeaderContent from './ScreenHeaderContent';

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
                    source={Constants.logoImage()}
                    style={{ width: '50%', height: 150, marginLeft: 10, marginBottom: '2rem' }}
                />
                {/* <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black' }}>
                    14 Trees
                </Text> */}
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
                        <View style={{ flexDirection: 'column', marginLeft: 15 }}>
                            <View style={{ width: 160 }}>
                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 20, color: 'black', fontWeight: 'bold' }}>
                                    {userDetails.name}
                                </Text>
                            </View>
                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 16, color: "green" }}>
                                {isAdmin ? Strings.labels.admin : Strings.labels.logger}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <Text style={{ fontFamily: 'Inter-Regular' }}>Loading user details...</Text>
                )}
            </View>
            <DrawerItemList {...props} />
            <View
                style={{
                    flexDirection: 'column',
                    position: 'relative',
                    //marginTop: 100,
                    alignSelf: 'center',
                }}>
                <TouchableOpacity
                    style={{ ...commonStyles.logOutButton }}
                    onPress={() => Utils.confirmAction(() => logout(props.navigationRef), undefined, Strings.messages.logoutConfirm)}>
                    <Text style={{ fontFamily: 'Inter-Regular', color: 'white', fontSize: 18 }}>
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
    const { langChanged, lightTheme } = useContext(GlobalContext);

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
                    headerRight: () => (
                        <ScreenHeaderContent />
                    ),
                    headerStyle: lightTheme ? commonStyles.drawerHeaderLight : commonStyles.drawerHeaderDark,
                    headerTitleStyle: lightTheme ? commonStyles.headerTitleStyleLight : commonStyles.headerTitleStyleDark,
                    headerTintColor: lightTheme ? commonStyles.headerTitleStyleLight.color : commonStyles.headerTitleStyleDark.color,
                    title: Strings.screenNames.HomePage,
                    drawerActiveBackgroundColor: '#F1FAEE',
                    drawerActiveTintColor: 'blue',
                    drawerStyle: {
                        backgroundColor: '#f0f3f7',
                        fontFamily: 'Inter-Regular'
                    }
                }}
            />
            <Drawer.Screen
                name={Strings.screenNames.getString('Shifts', Strings.english)}
                component={Shifts}
                options={{
                    headerStyle: lightTheme ? commonStyles.drawerHeaderLight : commonStyles.drawerHeaderDark,
                    headerTitleStyle: lightTheme ? commonStyles.headerTitleStyleLight : commonStyles.headerTitleStyleDark,
                    headerTintColor: lightTheme ? commonStyles.headerTitleStyleLight.color : commonStyles.headerTitleStyleDark.color,
                    title: Strings.screenNames.Shifts,
                    drawerActiveBackgroundColor: '#F1FAEE',
                    drawerActiveTintColor: 'blue',
                    drawerStyle: {
                        backgroundColor: '#f0f3f7',
                        fontFamily: 'Inter-Regular'
                    }
                }}
            />
            
            {isAdmin && (
                <Drawer.Screen
                    name={Strings.screenNames.getString('EditTree', Strings.english)}
                    component={EditTreeScreen}
                    options={{
                        headerStyle: lightTheme ? commonStyles.drawerHeaderLight : commonStyles.drawerHeaderDark,
                        headerTitleStyle: lightTheme ? commonStyles.headerTitleStyleLight : commonStyles.headerTitleStyleDark,
                        headerTintColor: lightTheme ? commonStyles.headerTitleStyleLight.color : commonStyles.headerTitleStyleDark.color,
                        title: Strings.screenNames.EditTree,
                        drawerActiveBackgroundColor: '#F1FAEE',
                        drawerActiveTintColor: 'blue',
                        drawerStyle: {
                            backgroundColor: '#f0f3f7',
                            fontFamily: 'Inter-Regular'
                        }
                    }}
                />
            )}
            {isAdmin && (
                <Drawer.Screen
                    name={Strings.screenNames.getString('VerifyUsers', Strings.english)}
                    component={VerifyusersScreen}
                    options={{
                        headerStyle: lightTheme ? commonStyles.drawerHeaderLight : commonStyles.drawerHeaderDark,
                        headerTitleStyle: lightTheme ? commonStyles.headerTitleStyleLight : commonStyles.headerTitleStyleDark,
                        headerTintColor: lightTheme ? commonStyles.headerTitleStyleLight.color : commonStyles.headerTitleStyleDark.color,
                        title: Strings.screenNames.VerifyUsers,
                        drawerActiveBackgroundColor: '#F1FAEE',
                        drawerActiveTintColor: 'blue',
                        drawerStyle: {
                            backgroundColor: '#f0f3f7',
                            fontFamily: 'Inter-Regular'
                        }
                    }}
                />
            )}
            <Drawer.Screen
                name={Strings.screenNames.getString('AppInfo', Strings.english)}
                component={About}
                options={{
                    headerStyle: lightTheme ? commonStyles.drawerHeaderLight : commonStyles.drawerHeaderDark,
                    headerTitleStyle: lightTheme ? commonStyles.headerTitleStyleLight : commonStyles.headerTitleStyleDark,
                    headerTintColor: lightTheme ? commonStyles.headerTitleStyleLight.color : commonStyles.headerTitleStyleDark.color,
                    title: Strings.screenNames.AppInfo,
                    drawerActiveBackgroundColor: '#F1FAEE',
                    drawerActiveTintColor: 'blue',
                    drawerStyle: {
                        backgroundColor: '#f0f3f7',
                        fontFamily: 'Inter-Regular'
                    }
                }}
            />

        </Drawer.Navigator >
    );
};