import { TouchableOpacity,View, Image, Text, Button, RootTagContext, BackHandler } from "react-native";
import { Constants, Utils, commonStyles,styleConfigs, fontAwesome5List, materialCommunityList } from "./Utils";
import Fa5Icon from 'react-native-vector-icons/FontAwesome5';
import { NavigationContainer, createNavigationContainerRef, useFocusEffect, useNavigationContainerRef } from '@react-navigation/native';
import {useState,useEffect, useCallback} from 'react';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DrawerContentScrollView, DrawerItemList, createDrawerNavigator } from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Strings } from "./Strings";
import HomeScreen from "./Home";
import LocalDataView from "./LocalDataView";
import AddTreeScreen from "./AddTree";
import EditTreeScreen from "./EditTree";
import VerifyusersScreen from "./VerifyUsers";
import { stackNavRef } from "./App";
const Drawer = createDrawerNavigator();
export const CustomButton = ({ text, opacityStyle,textStyle, onPress }) => {
    let finalOpacityStyle = commonStyles.defaultButtonStyle;
    if(opacityStyle){
        finalOpacityStyle = {...finalOpacityStyle,...opacityStyle};
    }
    let finalTextStyle = commonStyles.defaultButtonTextStyle;
    if(textStyle){
        finalTextStyle = {...finalTextStyle,...textStyle};
    }
    return (<TouchableOpacity onPress={onPress}>
        <View style={finalOpacityStyle}>
            <Text style={finalTextStyle}>{text}</Text>
        </View>
    </TouchableOpacity>);
}

export function MyIcon({name,size=30,color='green'}){
    if(fontAwesome5List.includes(name)){
        return <Fa5Icon name={name} size={size} color={color}/>;
    }
    else if(materialCommunityList.includes(name)){
        return <MCIcon name={name} size={size} color = {color}/>;
    }
    return <Text>??</Text>
}

export function MyIconButton({name,size=30,color='green',onPress,iconColor='white',text=undefined}){
    return <TouchableOpacity style={{...commonStyles.iconBtn,backgroundColor: color,}} onPress={onPress}>
            <MyIcon name={name} size={size} color={iconColor}></MyIcon>
            </TouchableOpacity>
}
const fillInUserDetails = async (setIsAdmin, setUserDetails) => {
    let storedUserDetails = await AsyncStorage.getItem(Constants.userDetailsKey);
    if (storedUserDetails) {
        storedUserDetails = JSON.parse(storedUserDetails);
        setUserDetails(storedUserDetails);
        if (storedUserDetails.adminID) {
            setIsAdmin(true);
        }
        else {
            setIsAdmin(false);
        }
    }
}
const logout = async(navigationRef)=>{
    await GoogleSignin.signOut();
    await AsyncStorage.removeItem(Constants.adminIdKey);
    await AsyncStorage.removeItem(Constants.userIdKey);
    await AsyncStorage.removeItem(Constants.userDetailsKey);
    navigationRef.current?.navigate(Strings.screenNames.getString('LogIn',Strings.english));
}
export const DrawerContent = (props) => {
    let {isAdmin,userDetails} = props;
    return (<DrawerContentScrollView {...props}>
      <View style={{flexDirection:'column',alignItems:'center',marginTop:50,bottom:0}}>
        <Image
          source={require('./assets/logo.png')} // Replace with your delete icon image
          style={{ width: 100, height: 100, marginLeft: 10 }} // Adjust the icon dimensions and margin
        />
        <Text style={{fontSize:20,fontWeight:'bold',color:'black'}}>14 Trees</Text>
        {
        userDetails
        ?
        <View style={{flexDirection:'row',alignItems:'center',alignSelf:'flex-start',margin:10,justifyContent:'space-around'}}>
          <Image source={{uri:userDetails.image}} style={{width:75,height:75,borderRadius:37.5}}>
          </Image>
          <View style={{flexDirection:'column',marginLeft:5}}>
            <Text style={{fontSize:15,color:'black'}}>{userDetails.name}</Text>
            <Text>{isAdmin?'Admin':'Logger'}</Text>
          </View>
        </View>
        :
        <Text>Loading user details...</Text>
        }
      </View>
      <DrawerItemList {...props} />
      <View style={{flexDirection:'column',position:'relative',marginTop:100,alignSelf:'center'}}>
        <Button title='Log out' onPress={()=>Utils.confirmAction(()=>logout(props.navigationRef),undefined,'Do you want to log out?')} style={commonStyles.logOutButton} color='red' ></Button>
      </View>
    </DrawerContentScrollView>)
}
export const DrawerNavigator = ({route})=>{
    const [isAdmin, setIsAdmin] = useState(false);
    const navigationRef = stackNavRef;
    const [userDetails,setUserDetails] = useState(null);
    useFocusEffect(useCallback(()=>{
      console.log('in focus');
      fillInUserDetails(setIsAdmin,setUserDetails);
    },[fillInUserDetails]))
    return (
      <Drawer.Navigator
      drawerContent={(props)=> <DrawerContent
                                userDetails={userDetails}
                                isAdmin={isAdmin}
                                navigationRef={navigationRef}
                                {...props}
                                />}>
                <Drawer.Screen
          name={Strings.screenNames.getString('HomePage',Strings.english)}
          component={HomeScreen}
          options={{
            ...styleConfigs.drawerHeaderOptions,
            title:Strings.screenNames.HomePage
          }} />
        <Drawer.Screen
        name={Strings.screenNames.getString('localDataView',Strings.english)}
        component={LocalDataView}
        options={{
          ...styleConfigs.drawerHeaderOptions,
          title:Strings.screenNames.localDataView
        }} />
        <Drawer.Screen
        name={Strings.screenNames.getString('AddTree',Strings.english)}
        component={AddTreeScreen}
        options={{
          ...styleConfigs.drawerHeaderOptions,
          title:Strings.screenNames.AddTree
        }}/>
        {isAdmin && 
        <Drawer.Screen
        name={Strings.screenNames.getString('EditTree',Strings.english)}
        component={EditTreeScreen}
        options={{
          ...styleConfigs.drawerHeaderOptions,
          title:Strings.screenNames.EditTree
        }}/>
        }
        {isAdmin && 
        <Drawer.Screen
        name={Strings.screenNames.getString('VerifyUsers',Strings.english)}
        component={VerifyusersScreen}
        options={{
          ...styleConfigs.drawerHeaderOptions,
          title:Strings.screenNames.VerifyUsers
        }}/>
        }
      </Drawer.Navigator>
  );
  }