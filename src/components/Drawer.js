const { Strings } = require("../services/Strings");
const { drawerNavigatorStyles } = require("../services/Styles");
const { Constants, getImageSourceObject, Utils } = require("../services/Utils");
import { Button, Drawer } from 'react-native-paper';
import { View, Image, Text } from "react-native";
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useContext } from 'react';
import GlobalContext from '../context/GlobalContext ';
import AsyncStorage from '@react-native-async-storage/async-storage';

const logout = async navigationRef => {
    await AsyncStorage.removeItem(Constants.adminIdKey);
    await AsyncStorage.removeItem(Constants.userIdKey);
    await AsyncStorage.removeItem(Constants.userDetailsKey);
    await AsyncStorage.removeItem(Constants.authToken);
    navigationRef.current?.navigate(
        Strings.screenNames.getString('LogIn', Strings.english),
    );
};

export const DrawerContent = (props) => {

    let { isAdmin, userDetails } = props;
    const { lightTheme, setLightTheme } = useContext(GlobalContext);
    const { langChanged, setLangChanged } = useContext(GlobalContext);

    const handleLanguageChanges = async () => {
      let lng = Strings.english;
      const storedLang = await Strings.getLanguage();
  
      if (lng === storedLang) {
        lng = Strings.marathi;
      }
  
      await Strings.setLanguage(lng);
      setLangChanged(!langChanged);
    };

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
            {/* <DrawerItemList {...props} /> */}
            <Drawer.Section>
              <DrawerItem
                icon={({size, color}) => (
                  <Button icon='home-outline' size={size + 20} color={color}/>
                )}
                label={Strings.screenNames.HomePage} 
                style={{marginVertical: -5}}
                labelStyle={{ marginLeft: -40 }} 
                onPress={() => props.navigation.navigate(Strings.screenNames.getString('HomePage', Strings.english))}
              />
            </Drawer.Section>
            <Drawer.Section>
              <DrawerItem 
                icon={({size, color}) => (
                  <Button icon='account-outline' size={size + 20} color={color}/>
                )}
                label={Strings.screenNames.UsersPage} 
                style={{marginVertical: -5}}
                labelStyle={{ marginLeft: -40 }} 
                onPress={() => props.navigation.navigate(Strings.screenNames.getString('UsersPage', Strings.english))}
              />
              <DrawerItem 
                icon={({size, color}) => (
                  <Button icon='map-marker-account-outline' size={size + 20} color={color}/>
                )}
                label={Strings.screenNames.VisitsPage} 
                style={{marginVertical: -5}}
                labelStyle={{ marginLeft: -40 }} 
                onPress={() => props.navigation.navigate(Strings.screenNames.getString('VisitsPage', Strings.english))}
              />
            </Drawer.Section>
            <Drawer.Section>
              <DrawerItem 
                icon={({size, color}) => (
                  <Button icon='alpha-s-circle-outline' size={size + 20} color={color}/>
                )}
                label={Strings.screenNames.SitesPage} 
                style={{marginVertical: -5}}
                labelStyle={{ marginLeft: -40, fontSize: 16 }} 
                onPress={() => props.navigation.navigate(Strings.screenNames.getString('SitesPage', Strings.english))}
              />
              <DrawerItem 
                icon={({size, color}) => (
                  <Button icon='alpha-p-circle-outline' size={size + 20} color={color}/>
                )}
                label={Strings.screenNames.PlotsPage} 
                style={{marginVertical: -5}}
                labelStyle={{ marginLeft: -40 }} 
                onPress={() => props.navigation.navigate(Strings.screenNames.getString('PlotsPage', Strings.english))}
              />
              <DrawerItem 
                icon={({size, color}) => (
                  <Button icon='tree-outline' size={size + 20} color={color}/>
                )}
                label={Strings.screenNames.TreesPage} 
                style={{marginVertical: -5}}
                labelStyle={{ marginLeft: -40 }} 
                onPress={() => props.navigation.navigate(Strings.screenNames.getString('TreesPage', Strings.english))}
              />
            </Drawer.Section>
            <Drawer.Section>
            <DrawerItem 
                icon={({size, color}) => (
                  <Button icon='theme-light-dark' size={size + 20} color={color}/>
                )}
                label={Strings.buttonLabels.ChangeTheme} 
                style={{marginVertical: -5}}
                labelStyle={{ marginLeft: -40 }} 
                onPress={() => setLightTheme(!lightTheme)}
              />
              <DrawerItem 
                icon={({size, color}) => (
                  <Button icon='translate' size={size + 20} color={color}/>
                )}
                label={Strings.buttonLabels.ChangeLanguage} 
                style={{marginVertical: -5}}
                labelStyle={{ marginLeft: -40 }} 
                onPress={handleLanguageChanges}
              />
            </Drawer.Section>
            <DrawerItem 
              icon={({size, color}) => (
                <Button icon='tools' size={size + 20} color={color}/>
              )}
              label={Strings.screenNames.Dev} 
              style={{marginVertical: -5}}
              labelStyle={{ marginLeft: -40 }} 
              onPress={() => props.navigation.navigate(Strings.screenNames.getString('Dev', Strings.english))}
            />
            <DrawerItem 
              icon={({size, color}) => (
                <Button icon='information-outline' size={size + 20} color={color}/>
              )}
              label={Strings.screenNames.AppInfo} 
              style={{marginVertical: -5}}
              labelStyle={{ marginLeft: -40 }} 
              onPress={() => props.navigation.navigate(Strings.screenNames.getString('AppInfo', Strings.english))}
            />
            <DrawerItem 
              icon={({size, color}) => (
                <Button icon='logout' size={size + 20} color={color}/>
              )}
              label={Strings.buttonLabels.logOut} 
              style={{marginVertical: -5}}
              labelStyle={{ marginLeft: -40 }} 
              onPress={() => Utils.confirmAction(() => logout(props.navigationRef), undefined, Strings.messages.logoutConfirm)}
            />
        </DrawerContentScrollView>
    );
};