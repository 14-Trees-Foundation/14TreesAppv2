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
import Users from '../screens/Users';
const Drawer = createDrawerNavigator();

const CustomDrawerToggleButton = ({ navigation }) => (
    <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
        <Image
            source={require('../../assets/icon-hamburger.png')}
            style={{ width: 35, height: 35, marginLeft: 10, marginLeft:15}} // Adjust size and margin as needed
            resizeMode="contain"
            aspectRatio={720 / 960}
        />
    </TouchableOpacity>
);

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
    const { langChanged, lightTheme, setLightTheme } = useContext(GlobalContext);

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
            )}
            screenOptions={({ navigation }) => ({
                headerLeft: () => <CustomDrawerToggleButton navigation={navigation} />,
                headerStyle: lightTheme ? commonStyles.drawerHeaderLight : commonStyles.drawerHeaderDark,
                headerTitleStyle: lightTheme ? commonStyles.headerTitleStyleLight : commonStyles.headerTitleStyleDark,
                headerTintColor: lightTheme ? commonStyles.headerTitleStyleLight.color : commonStyles.headerTitleStyleDark.color,
                drawerActiveBackgroundColor: '#F1FAEE',
                drawerActiveTintColor: 'blue',
                drawerStyle: {
                    backgroundColor: '#f0f3f7',
                    fontFamily: 'Inter-Regular'
                }
            })}
        >
            <Drawer.Screen
                name={Strings.screenNames.getString('HomePage', Strings.english)}
                component={HomeScreen}
                options={{
                    headerRight: () => (
                        <ScreenHeaderContent />
                    ),
                    title: Strings.screenNames.HomePage,
                    // headerStyle: lightTheme ? commonStyles.drawerHeaderLight : commonStyles.drawerHeaderDark,
                    // headerTitleStyle: lightTheme ? commonStyles.headerTitleStyleLight : commonStyles.headerTitleStyleDark,
                    // headerTintColor: lightTheme ? commonStyles.headerTitleStyleLight.color : commonStyles.headerTitleStyleDark.color,
                    // drawerActiveBackgroundColor: '#F1FAEE',
                    // drawerActiveTintColor: 'blue',
                    // drawerStyle: {
                    //     backgroundColor: '#f0f3f7',
                    //     fontFamily: 'Inter-Regular'
                    // }
                }}
            />
            <Drawer.Screen
                name={Strings.screenNames.getString('UsersPage', Strings.english)}
                component={Users}
                options={{
                    headerRight: () => (
                        <ScreenHeaderContent />
                    ),
                    title: Strings.screenNames.UsersPage,
                    // headerStyle: lightTheme ? commonStyles.drawerHeaderLight : commonStyles.drawerHeaderDark,
                    // headerTitleStyle: lightTheme ? commonStyles.headerTitleStyleLight : commonStyles.headerTitleStyleDark,
                    // headerTintColor: lightTheme ? commonStyles.headerTitleStyleLight.color : commonStyles.headerTitleStyleDark.color,
                    // drawerActiveBackgroundColor: '#F1FAEE',
                    // drawerActiveTintColor: 'blue',
                    // drawerStyle: {
                    //     backgroundColor: '#f0f3f7',
                    //     fontFamily: 'Inter-Regular'
                    // }
                }}
            />
            <Drawer.Screen
                name={Strings.screenNames.getString('Shifts', Strings.english)}
                component={Shifts}
                options={{
                    // headerStyle: lightTheme ? commonStyles.drawerHeaderLight : commonStyles.drawerHeaderDark,
                    // headerTitleStyle: lightTheme ? commonStyles.headerTitleStyleLight : commonStyles.headerTitleStyleDark,
                    // headerTintColor: lightTheme ? commonStyles.headerTitleStyleLight.color : commonStyles.headerTitleStyleDark.color,
                    // drawerActiveBackgroundColor: '#F1FAEE',
                    // drawerActiveTintColor: 'blue',
                    // drawerStyle: {
                    //     backgroundColor: '#f0f3f7',
                    //     fontFamily: 'Inter-Regular'
                    // },
                    title: Strings.screenNames.Shifts,
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
                            <View style={{ height: 35, marginRight: 6, marginTop: 2, borderRadius: 10, borderColor: "white", borderWidth: 1 }}>
                                <Text style={{ color: lightTheme ? '#333' : 'black', fontSize: 20, fontWeight: "bold", paddingLeft: 4, paddingTop: 2 }}>2.4.1</Text>
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
                        // headerStyle: lightTheme ? commonStyles.drawerHeaderLight : commonStyles.drawerHeaderDark,
                        // headerTitleStyle: lightTheme ? commonStyles.headerTitleStyleLight : commonStyles.headerTitleStyleDark,
                        // headerTintColor: lightTheme ? commonStyles.headerTitleStyleLight.color : commonStyles.headerTitleStyleDark.color,
                        // drawerActiveBackgroundColor: '#F1FAEE',
                        // drawerActiveTintColor: 'blue',
                        // drawerStyle: {
                        //     backgroundColor: '#f0f3f7',
                        //     fontFamily: 'Inter-Regular'
                        // },
                        title: Strings.screenNames.EditTree,
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
                                <View style={{ height: 35, marginRight: 6, marginTop: 2, borderRadius: 10, borderColor: "white", borderWidth: 1 }}>
                                    <Text style={{ color: lightTheme ? '#333' : 'black', fontSize: 20, fontWeight: "bold", paddingLeft: 4, paddingTop: 2 }}>2.4.1</Text>
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
                        title: Strings.screenNames.VerifyUsers,
                        // headerStyle: lightTheme ? commonStyles.drawerHeaderLight : commonStyles.drawerHeaderDark,
                        // headerTitleStyle: lightTheme ? commonStyles.headerTitleStyleLight : commonStyles.headerTitleStyleDark,
                        // headerTintColor: lightTheme ? commonStyles.headerTitleStyleLight.color : commonStyles.headerTitleStyleDark.color,
                        // drawerActiveBackgroundColor: '#F1FAEE',
                        // drawerActiveTintColor: 'blue',
                        // drawerStyle: {
                        //     backgroundColor: '#f0f3f7',
                        //     fontFamily: 'Inter-Regular'
                        // }
                    }}
                />
            )}
            <Drawer.Screen
                name={Strings.screenNames.getString('AppInfo', Strings.english)}
                component={About}
                options={{
                    title: Strings.screenNames.AppInfo,
                    // headerStyle: lightTheme ? commonStyles.drawerHeaderLight : commonStyles.drawerHeaderDark,
                    // headerTitleStyle: lightTheme ? commonStyles.headerTitleStyleLight : commonStyles.headerTitleStyleDark,
                    // headerTintColor: lightTheme ? commonStyles.headerTitleStyleLight.color : commonStyles.headerTitleStyleDark.color,
                    // drawerActiveBackgroundColor: '#F1FAEE',
                    // drawerActiveTintColor: 'blue',
                    // drawerStyle: {
                    //     backgroundColor: '#f0f3f7',
                    //     fontFamily: 'Inter-Regular'
                    // }
                }}
            />
        </Drawer.Navigator >
    );
};