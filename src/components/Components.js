import { TouchableOpacity,View, Image, Text, Button, RootTagContext, BackHandler, TextInput } from "react-native";
import { Constants, Utils, commonStyles,getImageSourceObject,logoSrc,styleConfigs} from "../services/Utils";
import { fontAwesome5List, materialCommunityList } from '../services/IconLists';
import Fa5Icon from 'react-native-vector-icons/FontAwesome5';
import { NavigationContainer, createNavigationContainerRef, useFocusEffect, useNavigationContainerRef } from '@react-navigation/native';
import {useState,useEffect, useCallback} from 'react';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DrawerContentScrollView, DrawerItemList, createDrawerNavigator } from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Strings } from "../services/Strings";
import HomeScreen from "../screens/Home";
import AddTreeScreen from "../screens/AddTree";
import EditTreeScreen from "../screens/EditTree";
import VerifyusersScreen from "../screens/VerifyUsers";
import { stackNavRef } from "../App";
import { LocalDataNavigator } from "./LocalDataNavigator";
// import { ProgressBar } from 'react-native-progress';
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
export function MyIconStack({names,sizes,size=30,color='green',styles}){
  if(styles && names.length!==styles.length){
      throw "Names and styles lengths must match in MyIconStack"
  }
  if(sizes && names.length!==sizes.length){
    throw "Names and sizes lengths must match in MyIconStack"
  }

    return <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',position:'relative',marginRight:10,padding:5,paddingRight:0}}>
              {
                styles && sizes?
                names.map((iconName,index,[])=>{
                  return <View key={iconName+Math.random().toString()} style={{...styles[index],position:'absolute'}}>
                            <MyIcon name={iconName} size={sizes[index]} color={color}/>
                          </View>
                })
                :
                sizes?
                names.map((iconName,index,[])=>{
                  return <View key={iconName+Math.random().toString()} style={{...styles[index],position:'absolute'}}>
                            <MyIcon name={iconName} size={sizes[index]} color={color}/>
                          </View>
                })
                :
                styles?
                names.map((iconName,index,[])=>{
                  return <View key={iconName+Math.random().toString()} style={{...styles[index],position:'absolute'}}>
                            <MyIcon name={iconName} size={size} color={color}/>
                          </View>
                }):
                names.map((iconName,index,[])=>{
                  return <View key={iconName+Math.random().toString()} style={{position:'absolute'}}>
                            <MyIcon name={iconName} size={size} color={color}/>
                          </View>
                })
              }
            </View>
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

export function MyIconButton({name,names,sizes,styles,size=30,color='green',onPress,iconColor='white',text=undefined}){
    if(name){
      return <TouchableOpacity style={{...commonStyles.iconBtn,backgroundColor: color,}} onPress={onPress}>
      <MyIcon name={name} size={size} color={iconColor}></MyIcon>
      {
        text && <Text style={{color:iconColor,fontSize:size*0.8}}> {text}</Text>
      }
      </TouchableOpacity>
    }
    else if(names){
      return <TouchableOpacity style={{...commonStyles.iconBtn,backgroundColor: color,paddingLeft:15}} onPress={onPress}>
      <MyIconStack names={names} styles={styles} sizes={sizes} size={size} color={iconColor}/>
        {
          text && <Text style={{color:iconColor,fontSize:size*0.8}}> {text}</Text>
        }
      </TouchableOpacity>
    }
    else{
      return <TouchableOpacity style={{...commonStyles.iconBtn,backgroundColor: color,}} onPress={onPress}>
      <MyIcon name={'??'} size={size} color={iconColor}></MyIcon>
      {
        text && <Text style={{color:iconColor,fontSize:size*0.8}}> {text}</Text>
      }
      </TouchableOpacity>
    }

}
export const SaveButton = ({onPress,text=Strings.buttonLabels.save,size=30})=>{
  return <MyIconButton name={"check"} onPress={onPress} text={text} size={size}></MyIconButton>
}
export const CancelButton = ({onPress,text=Strings.buttonLabels.cancel,size=30})=>{
  return <MyIconButton name={"cancel"}
  onPress={onPress} color="red" size={size} text={text}></MyIconButton>
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
          source={Constants.logoImage()} // Replace with your delete icon image
          style={{ width: 100, height: 100, marginLeft: 10 }} // Adjust the icon dimensions and margin
        />
        <Text style={{fontSize:20,fontWeight:'bold',color:'black'}}>14 Trees</Text>
        {
        userDetails
        ?
        <View style={{flexDirection:'row',alignItems:'center',alignSelf:'flex-start',margin:10,justifyContent:'space-around'}}>
          <Image source={getImageSourceObject(userDetails.image)} style={{width:75,height:75,borderRadius:37.5}}>
          </Image>
          <View style={{flexDirection:'column',marginLeft:5}}>
            <Text style={{fontSize:15,color:'black'}}>{userDetails.name}</Text>
            <Text>{isAdmin?Strings.labels.admin:Strings.labels.logger}</Text>
          </View>
        </View>
        :
        <Text>Loading user details...</Text>
        }
      </View>
      <DrawerItemList {...props} />
      <View style={{flexDirection:'column',position:'relative',marginTop:100,alignSelf:'center'}}>
        <Button title={Strings.buttonLabels.logOut} onPress={()=>Utils.confirmAction(()=>logout(props.navigationRef),undefined,Strings.messages.logoutConfirm)} style={commonStyles.logOutButton} color='red' ></Button>
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
        name={Strings.screenNames.getString('LocalDataNavigator',Strings.english)}
        component={LocalDataNavigator}
        options={{
          ...styleConfigs.drawerHeaderOptions,
          title:Strings.screenNames.LocalDataView,
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

export const ImageWithUneditableRemark = ({item,displayString,onDelete})=>{
  return (
    <View style={{
        marginHorizontal: 10,
        marginVertical: 4,
        borderWidth: 2,
        borderColor: '#5DB075',
        borderRadius: 10,
        flexDirection: 'column',
    }}>
        <View style={{ margin: 5, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <Image
                source={{ uri: `data:image/jpeg;base64,${item.data}` }}
                style={{ width: 100, height: 100, }} // Set your desired image dimensions and margin
            />
            <Text style={{ ...commonStyles.text3, textAlign: 'center' }}>{displayString}</Text>
            <TouchableOpacity onPress={() => Utils.confirmAction(()=>onDelete(item),Strings.alertMessages.confirmDeleteImage)}>
                <Image
                    source={require('../../assets/icondelete.png')} // Replace with your delete icon image
                    style={{ width: 20, height: 20, marginLeft: 10 }} // Adjust the icon dimensions and margin
                />
            </TouchableOpacity>
        </View>

        <View style={{}}>
            <Text style={commonStyles.text4}>
                Remark: {item.meta.remark}
            </Text>
        </View>
    </View>
);
}

export const ImageWithEditableRemark = ({item,displayString,onChangeRemark,onDelete})=>{
  return (
    <View style={{
        marginHorizontal: 10,
        marginVertical: 4,
        borderWidth: 2,
        borderColor: '#5DB075',
        borderRadius: 10,
        flexDirection: 'column',
    }}>
        <View style={{ margin: 5, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <Image
                source={{ uri: `data:image/jpeg;base64,${item.data}` }}
                style={{ width: 100, height: 100, }} // Set your desired image dimensions and margin
            />
            <Text style={{ ...commonStyles.text3, textAlign: 'center' }}>{displayString}</Text>
            <TouchableOpacity onPress={() => Utils.confirmAction(()=>onDelete(item),Strings.alertMessages.confirmDeleteImage)}>
                <Image
                    source={require('../../assets/icondelete.png')} // Replace with your delete icon image
                    style={{ width: 20, height: 20, marginLeft: 10 }} // Adjust the icon dimensions and margin
                />
            </TouchableOpacity>
        </View>

        <View>
            {
                item.name.startsWith('http')?
                <Text style={commonStyles.text4}>
                    Remark: {item.meta.remark}
                </Text>
                :<TextInput
                style={commonStyles.remark}
                placeholder={Strings.messages.enterRemark}
                placeholderTextColor={'#000000'}
                onChangeText={(text) => onChangeRemark(text)}
                value={item.meta.remark}
            />
            }
        </View>
    </View>
);
}