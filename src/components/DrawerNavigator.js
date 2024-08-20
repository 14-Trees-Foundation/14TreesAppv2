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
import { DrawerContentScrollView, DrawerItem, DrawerItemList, createDrawerNavigator, } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import About from '../screens/About';
import Shifts from "../screens/Shifts";
import ScreenHeaderContent from './ScreenHeaderContent';
import { Button } from 'react-native-paper';
import Users from '../screens/Users';
import Plots from "../screens/Plots"
import Sites from '../screens/Sites';
import Visits from '../screens/Visits';

import Trees from '../screens/Trees';
import { APP_VERSION } from '../constants/constants';
import { DrawerContent } from './Drawer';
import LoginScreen from '../screens/Login';
import Home from '../screens/HomeScreen';
import Dev from '../screens/Dev';
import { MapScreen } from './Map';
import PlotSaplings from '../screens/PlotSaplings';

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
        if (storedUserDetails.roles.includes('admin')) {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    }
};

const Drawer = createDrawerNavigator();

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
                component={Home}
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
                name={Strings.screenNames.getString('VisitsPage', Strings.english)}
                component={Visits}
                options={{
                    headerRight: () => (
                        <ScreenHeaderContent />
                    ),
                    title: Strings.screenNames.VisitsPage,
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
                name={Strings.screenNames.getString('TreesPage', Strings.english)}
                component={Trees}
                options={{
                    headerRight: () => (
                        <ScreenHeaderContent />
                    ),
                    title: Strings.screenNames.TreesPage,
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
                name={Strings.screenNames.getString('PlotsPage', Strings.english)}
                component={Plots}
                options={{
                    headerRight: () => (
                        <ScreenHeaderContent />
                    ),
                    title: Strings.screenNames.PlotsPage,
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
                name={Strings.screenNames.getString('SitesPage', Strings.english)}
                component={Sites}
                options={{
                    headerRight: () => (
                        <ScreenHeaderContent />
                    ),
                    title: Strings.screenNames.SitesPage,
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
                        <ScreenHeaderContent />
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
                            <ScreenHeaderContent />
                        )
                    }}
                />
            )}

            {/* Hidden Screen */}
            {isAdmin && false && (
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
            <Drawer.Screen
                name={Strings.screenNames.getString('Dev', Strings.english)}
                component={Dev}
                options={{
                    title: Strings.screenNames.Dev,
                }}
            />
        </Drawer.Navigator >
    );
};