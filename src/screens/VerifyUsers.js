import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { CustomButton } from '../components/Components';
import { DataService } from '../services/DataService';
import { Strings } from '../services/Strings';
import { Utils } from '../services/Utils';

const VerifyusersScreen = ({navigation}) => {
  
    const [users, setUsers] = useState([]);
    const [adminID,setAdminID] = useState('');
    const fetchUsers = async (adminIDValue) => {
        const userlist = await DataService.fetchUsers(adminIDValue);
        setUsers(userlist.data);
    }

    const verifyUser = async (id) => {
        console.log(id,adminID);
        const response = await DataService.verifyUser(id,adminID);
        if(!response){
            return;
        }
        if(response.status == 200){
            ToastAndroid.show(Strings.alertMessages.UserVerified,ToastAndroid.LONG);
            fetchUsers(adminID);
        }
       
    }

    useEffect(() => {
        Utils.getAdminId().then((value)=>{
            setAdminID(value);
        })
    }, []);
    useEffect(()=>{
        if(adminID){
            fetchUsers(adminID);
        }
    },[adminID])
    const renderelement = ({item}) => {
        // console.log(item);
        return (
            <View style={{flexDirection:'column', margin:5}}>
                <View style={{borderBottomWidth:2,}}>
                   
                
                <View >
                    <Text style={styles.text3}>{Strings.messages.Name} {item.name} </Text>
                    <Text style={styles.text3}>{Strings.messages.Email} {item.email} </Text>
                </View>
                
                
                <View style={{margin:8, marginBottom:8, width:'50%', alignSelf:'center'}}>
                    <Button
                        title={Strings.buttonLabels.Verify}
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
            <View style={{marginTop:5,flexDirection:'row',justifyContent:'space-around'}}>
            <Text style={styles.text2}> {Strings.messages.ListUnverifiedUsers} </Text>
            <CustomButton text={Strings.buttonLabels.Refresh} onPress={()=>fetchUsers(adminID)}></CustomButton>
            </View>
            <View style={{height:500,margin:5,borderWidth:2,borderColor: '#5DB075',borderRadius: 5,flexDirection:'column',}}>
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