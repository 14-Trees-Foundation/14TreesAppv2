import { Strings } from '../services/Strings';
import HomeScreen from '../screens/Home';
import EditTreeScreen from '../screens/EditTree';
import VerifyusersScreen from '../screens/VerifyUsers';
import { stackNavRef } from '../App';
import GlobalContext from "../context/GlobalContext ";
import { CustomButtonStyles, commonStyles, drawerNavigatorStyles, ScreenHeaderContentStyles } from "../services/Styles";
import { useState, useEffect, useCallback, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Image, Text, BackHandler, TouchableOpacity } from "react-native";
import { Constants, Utils, getImageSourceObject, logoSrc } from "../services/Utils";
import { DrawerContentScrollView, DrawerItemList, createDrawerNavigator, } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import About from '../screens/About';
import Shifts from "../screens/Shifts";
import ScreenHeaderContent from './ScreenHeaderContent';
import { Button } from 'react-native-paper';
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
            <View style={drawerNavigatorStyles.navigatorView}>
                <Image source={Constants.logoImage()} style={drawerNavigatorStyles.image} />
                {userDetails ? (
                    <View
                        style={drawerNavigatorStyles.userDetails}>
                        <Image
                            source={getImageSourceObject(userDetails.image)}
                            style={drawerNavigatorStyles.userImage}></Image>
                        <View style={{ flexDirection: 'column', marginLeft: 15 }}>
                            <View style={{ width: 160 }}>
                                <Text
                                    style={drawerNavigatorStyles.userName}>
                                    {userDetails.name}
                                </Text>
                            </View>
                            <Text
                                style={drawerNavigatorStyles.userType}>
                                {isAdmin ? Strings.labels.admin : Strings.labels.logger}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <Text style={{ fontFamily: 'Inter-Regular' }}>Loading user details...</Text>
                )}
            </View>
            <DrawerItemList {...props} />
            <View style={drawerNavigatorStyles.logOutButton}>
                <Button
                    onPress={() => Utils.confirmAction(() => logout(props.navigationRef), undefined, Strings.messages.logoutConfirm)}
                    mode="contained"
                    buttonColor='red'
                    labelStyle={CustomButtonStyles.buttonLabel}
                    style={CustomButtonStyles.button}
                >
                    {Strings.buttonLabels.logOut}
                </Button>
            </View>
        </DrawerContentScrollView>
    );
};

export const DrawerNavigator = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const navigationRef = stackNavRef;
    const [userDetails, setUserDetails] = useState(null);
    const [toggleMode, setToggleMode] = useState(false); //dark by default
    const { langChanged, lightTheme,setLightTheme } = useContext(GlobalContext);

    useEffect(() => {

        const backAction = () => {
            console.log("exiting from drawerScreen-------");
            BackHandler.exitApp();
            return true;
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
                    },
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                            {/* <TouchableOpacity
                                style={{ marginRight: 15 }}
                                onPress={() => {
                                    setToggleMode(!toggleMode);
                                    setLightTheme(!lightTheme);
                                }}
                            >
                                {toggleMode ? <Image
                                    source={require('../../assets/icon-brightness-on.png')}
                                    style={ScreenHeaderContentStyles.modeIcon}
                                /> : <Image
                                    source={require('../../assets/icon-brightness.png')}
                                    style={ScreenHeaderContentStyles.modeIcon}
                                />}
                            </TouchableOpacity> */}
                            <View style={{ width: 40, height: 35, marginRight: 6, marginTop: 2, borderRadius: 10, borderColor: "white", borderWidth: 1 }}>
                                <Text style={{ color: "black", fontSize: 20, fontWeight: "bold", paddingLeft: 4, paddingTop: 2 }}>2.4</Text>
                            </View>
                        </View>
                    )
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
                        },
                        headerRight: () => (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                                <TouchableOpacity
                                    style={{ marginRight: 15 }}
                                    onPress={() => {
                                        setToggleMode(!toggleMode);
                                        setLightTheme(!lightTheme);
                                    }}
                                >
                                    {toggleMode ? <Image
                                        source={require('../../assets/icon-brightness-on.png')}
                                        style={ScreenHeaderContentStyles.modeIcon}
                                    /> : <Image
                                        source={require('../../assets/icon-brightness.png')}
                                        style={ScreenHeaderContentStyles.modeIcon}
                                    />}
                                </TouchableOpacity>
                                <View style={{ width: 40, height: 35, marginRight: 6, marginTop: 2, borderRadius: 10, borderColor: "white", borderWidth: 1 }}>
                                    <Text style={{ color: "black", fontSize: 20, fontWeight: "bold", paddingLeft: 4, paddingTop: 2 }}>2.4</Text>
                                </View>
                            </View>
                        )
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