import { TouchableOpacity, View, Image, Text, Button, TextInput, Modal } from "react-native";
import { Constants, Utils, getImageSourceObject, logoSrc } from "../services/Utils";
import { fontAwesome5List, materialCommunityList } from '../services/IconLists';
import Fa5Icon from 'react-native-vector-icons/FontAwesome5';
import { NavigationContainer, createNavigationContainerRef, useFocusEffect, useNavigationContainerRef } from '@react-navigation/native';
import { useState, useEffect, useCallback, useContext } from 'react';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DrawerContentScrollView, DrawerItemList, createDrawerNavigator, } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
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


const Drawer = createDrawerNavigator();

export const CustomButton = ({ text, opacityStyle, textStyle, onPress }) => {
  let finalOpacityStyle = commonStyles.defaultButtonStyle;
  if (opacityStyle) {
    finalOpacityStyle = { ...finalOpacityStyle, ...opacityStyle };
  }
  let finalTextStyle = commonStyles.defaultButtonTextStyle;
  if (textStyle) {
    finalTextStyle = { ...finalTextStyle, ...textStyle };
  }
  const extraStyle = text === Strings.buttonLabels.login ? { backgroundColor: "green" } : {};

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{ ...finalOpacityStyle, ...extraStyle }}>
        <Text style={{ ...finalTextStyle, fontSize: 20 }}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function MyIconStack({ names, sizes, size = 30, color = 'green', styles }) {
  if (styles && names.length !== styles.length) {
    throw "Names and styles lengths must match in MyIconStack"
  }
  if (sizes && names.length !== sizes.length) {
    throw "Names and sizes lengths must match in MyIconStack"
  }

  return <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative', marginRight: 10, padding: 5, paddingRight: 0 }}>
    {
      styles && sizes ?
        names.map((iconName, index, []) => {
          return <View key={iconName + Math.random().toString()} style={{ ...styles[index], position: 'absolute' }}>
            <MyIcon name={iconName} size={sizes[index]} color={color} />
          </View>
        })
        :
        sizes ?
          names.map((iconName, index, []) => {
            return <View key={iconName + Math.random().toString()} style={{ ...styles[index], position: 'absolute' }}>
              <MyIcon name={iconName} size={sizes[index]} color={color} />
            </View>
          })
          :
          styles ?
            names.map((iconName, index, []) => {
              return <View key={iconName + Math.random().toString()} style={{ ...styles[index], position: 'absolute' }}>
                <MyIcon name={iconName} size={size} color={color} />
              </View>
            }) :
            names.map((iconName, index, []) => {
              return <View key={iconName + Math.random().toString()} style={{ position: 'absolute' }}>
                <MyIcon name={iconName} size={size} color={color} />
              </View>
            })
    }
  </View>
}
export function MyIcon({ name, size = 30, color = 'green' }) {
  if (fontAwesome5List.includes(name)) {
    return <Fa5Icon name={name} size={size} color={color} />;
  } else if (materialCommunityList.includes(name)) {
    return <MCIcon name={name} size={size} color={color} />;
  }
  return <Text>??</Text>;
}
//Namrata
export function MyIconButton({
  name,
  names,
  sizes,
  styles,
  size = 30,
  color = '#1A894E',
  onPress,
  iconColor = 'white',
  text = undefined,
}) {
  if (name) {
    const lngStyle = text === Strings.buttonLabels.SelectLanguage ?{backgroundColor: 'grey',borderColor:"#C2C2C2",borderWidth:1,fontSize:10, width: 230,height :50 }:{}
    return (
      <TouchableOpacity
        style={{ ...commonStyles.iconBtn, backgroundColor: color, ...lngStyle }}
        onPress={onPress}>
        <MyIcon name={name} size={size} color={iconColor}></MyIcon>
        {text && (
          <Text style={{ color: iconColor, fontSize: size * 0.8 }}> {text}</Text>
        )}
      </TouchableOpacity>
    );
  } else if (names) {
    return (
      <TouchableOpacity
        style={{
          ...commonStyles.iconBtn,
          backgroundColor: color,
          paddingLeft: 15,
        }}
        onPress={onPress}>
        <MyIconStack
          names={names}
          styles={styles}
          sizes={sizes}
          size={size}
          color={iconColor}
        />
        {text && (
          <Text style={{ color: iconColor, fontSize: size * 0.8 }}> {text}</Text>
        )}
      </TouchableOpacity>
    );
  } else {
    return (
      <TouchableOpacity
        style={{ ...commonStyles.iconBtn, backgroundColor: color }}
        onPress={onPress}>
        <MyIcon name={'??'} size={size} color={iconColor}></MyIcon>
        {text && (
          <Text style={{ color: iconColor, fontSize: size * 0.8 }}> {text}</Text>
        )}
      </TouchableOpacity>
    );
  }
}

export const SaveButton = ({
  onPress,
  text = Strings.buttonLabels.save,
  size = 30,
}) => {
  return (
    <MyIconButton
      name={'check'}
      onPress={onPress}
      text={text}
      size={size}></MyIconButton>
  );
};
export const CancelButton = ({
  onPress,
  text = Strings.buttonLabels.cancel,
  size = 30,
}) => {
  return (
    <MyIconButton
      name={'cancel'}
      onPress={onPress}
      color="red"
      size={size}
      text={text}></MyIconButton>
  );
};

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

export const DrawerContent = props => {
  let { isAdmin, userDetails } = props;

  // console.log("userDetails: ", userDetails);

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
              <Text style = {{fontSize:16,color:"green"}}>
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
          style={{...commonStyles.logOutButton}}
          onPress={() => Utils.confirmAction(() => logout(props.navigationRef), undefined, Strings.messages.logoutConfirm)}>
          <Text style={{ color: 'white', fontSize: 18 }}>
            {Strings.buttonLabels.logOut}
          </Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

export const DrawerNavigator = ({ route }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigationRef = stackNavRef;
  const [userDetails, setUserDetails] = useState(null);
  const { langChanged } = useContext(LangContext);

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
    </Drawer.Navigator>
  );
};

export const ImageWithUneditableRemark = ({ item, displayString, onDelete }) => {
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const openImageModal = () => {
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
  };

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
        {/* changes by manjur */}
        <TouchableOpacity onPress={openImageModal}
          style={{ alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#5DB075', borderRadius: 5, padding: 5 }}>
          <Image
            source={{ uri: `data:image/jpeg;base64,${item.data}` }}
            style={{ width: 100, height: 100, }} // Set your desired image dimensions and margin
          />
        </TouchableOpacity>
        <Text style={{ ...commonStyles.textX, textAlign: 'center' }}>{displayString}</Text>
        <TouchableOpacity onPress={() => Utils.confirmAction(() => onDelete(item), Strings.alertMessages.confirmDeleteImage)}>
          <Image
            source={require('../../assets/icondelete.png')} // Replace with your delete icon image
            style={{ width: 20, height: 20, marginLeft: 10 }} // Adjust the icon dimensions and margin
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={imageModalVisible}
        transparent={true}
        onRequestClose={false}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <TouchableOpacity onPress={closeImageModal} style={{ position: 'absolute', top: 20, right: 20 }}>
            <Image
              source={require('../../assets/icondelete.png')} // Replace with your delete icon image
              style={{ width: 50, height: 50, marginLeft: 10 }} // Adjust the icon dimensions and margin
            />
          </TouchableOpacity>
          <Image
            source={{ uri: `data:image/jpeg;base64,${item.data}`}}
            style={{ width: 350, height: 350 }} // Set your desired larger image dimensions
          />
        </View>
      </Modal>

      <View style={{}}>
        <Text style={commonStyles.text4}>
          Remark: {item.meta.remark}
        </Text>
      </View>
    </View>
  );
}

export const ImageWithEditableRemark = ({ item, displayString, onChangeRemark, onDelete }) => {
  const [imageModalVisible, setImageModalVisible] = useState(false);
  

  const openImageModal = () => {
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
  };

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
        {/* changes by manjur */}
        <TouchableOpacity onPress={openImageModal}
          style={{ alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#5DB075', borderRadius: 5, padding: 5 }}>
          <Image
            source={{ uri: `data:image/jpeg;base64,${item.data}` }}
            style={{ width: 100, height: 100, }} // Set your desired image dimensions and margin
          />
        </TouchableOpacity>
        <Text style={{ ...commonStyles.textX, textAlign: 'center' }}>{displayString}</Text>
        <TouchableOpacity onPress={() => Utils.confirmAction(() => onDelete(item), Strings.alertMessages.confirmDeleteImage)}>
          <Image
            source={require('../../assets/icondelete.png')} // Replace with your delete icon image
            style={{ width: 20, height: 20, marginLeft: 10 }} // Adjust the icon dimensions and margin
          />
        </TouchableOpacity>
      </View>


      <Modal
        visible={imageModalVisible}
        transparent={true}
        onRequestClose={false}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <TouchableOpacity onPress={closeImageModal} style={{ position: 'absolute', top: 20, right: 20 }}>
            <Image
              source={require('../../assets/icondelete.png')} // Replace with your delete icon image
              style={{ width: 50, height: 50, marginLeft: 10 }} // Adjust the icon dimensions and margin
            />
          </TouchableOpacity>
          <Image
            source={{ uri: `data:image/jpeg;base64,${item.data}`}}
            style={{ width: 345, height: 350 }} // Set your desired larger image dimensions
          />
        </View>
      </Modal>


      <View>
        {item.name.startsWith('http') ? (
          <Text style={commonStyles.text4}>Remark: {item.meta.remark}</Text>
        ) : (
          <TextInput
            style={commonStyles.remark}
            placeholder={Strings.messages.enterRemark}
            placeholderTextColor={'#000000'}
            onChangeText={text => onChangeRemark(text)}
            value={item.meta.remark}
          />
        )}
      </View>
    </View>
  );
}