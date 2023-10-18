import React, {useEffect,useState} from 'react';
import { View, Text,TextInput, Button,  Alert, StyleSheet, TouchableOpacity, ToastAndroid} from 'react-native';
import { Dropdown } from './DropDown';
import { DataService } from './DataService';
import { FlatList } from 'react-native-gesture-handler';
import { Utils } from './Utils';

const VerifyusersScreen = ({navigation}) => {
  
    const [users, setUsers] = useState([]);
    
    const fetchUsers = async () => {
        const userlist = await DataService.fetchUsers(Utils.adminId);
        setUsers(userlist.data);
    }

    
    const verifyUser = async (id) => {
        const response = await DataService.verifyUser(id);
        console.log(response.data);
        if(response.status == 200){
            ToastAndroid.show('User Verified',ToastAndroid.LONG);
            fetchUsers();
        }
       
    }

    useEffect(() => {
        fetchUsers();
        // setUsers(userList);
        // console.log(users);
    }, []);

    const renderelement = ({item}) => {
        // console.log(item);
        return (
            <View style={{flexDirection:'column', margin:5}}>
                <View style={{borderBottomWidth:2,}}>
                   
                
                <View >
                    <Text style={styles.text3}> Name : {item.name} </Text>
                    <Text style={styles.text3}> Email : {item.email} </Text>
                </View>
                
                
                <View style={{margin:8, marginBottom:8, width:'50%', alignSelf:'center'}}>
                    <Button
                        title="Verify"
                        onPress={() => verifyUser(item._id)}
                        color={'#5DB075'}
                    />
                </View>
                </View>
            </View>
        )
    }
   
    return (
        <View style={{backgroundColor:'white', height:'100%'}}>
            <View style={{backgroundColor:'#5DB075', borderBottomLeftRadius:10, borderBottomRightRadius:10}}>
                <Text style={styles.headerText} > Verify Users </Text>
            </View>
            <Text style={styles.text2}> List of Unverified Users </Text>
            <View style={{height:500,margin:2, marginTop:10,borderWidth:2,borderColor: '#5DB075',borderRadius: 5,flexDirection:'column',}}>
            <FlatList
                data = {users}
                renderItem={renderelement}
                >
            </FlatList>

            </View>
        </View>
    )
}

export default VerifyusersScreen;

const styles = StyleSheet.create({
    headerText: {
      fontSize: 30, color: 'white', textAlign: 'center', marginTop: 30, marginBottom: 30, fontFamily:'cochin', fontWeight:'bold' , textShadowColor: 'rgba(0, 0, 0, 0.5)', 
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3, 
    },
    text2: {  
        color: 'black',
        fontSize:20,
        textAlign: 'left',
        marginTop: 15,
        marginBottom: 30
        
    },
    text3: {
        color: 'black',
        fontSize:18,
        textAlign: 'left',
        margin:2,
    }
  });