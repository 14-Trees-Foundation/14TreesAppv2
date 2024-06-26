import React, { useContext } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { Card } from 'react-native-paper';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ShiftsCardStyles, commonStyles } from '../services/Styles';
import { Strings } from '../services/Strings';
import GlobalContext from '../context/GlobalContext ';

const TreesInShiftHeader = ({ item }) => {

    const { lightTheme } = useContext(GlobalContext);
    const syncUploadComplete = (item.shiftuploadcomplete == 1);

    return (
        <Card
            style={{
                flex: 1,
                flexDirection: 'row',

                // justifyContent: 'center',
                backgroundColor: '#EBEBEB',
                opacity: 0.9,
                borderRadius: 3,
                marginTop: 7,
                marginHorizontal: 10,
                //borderWidth: 2,
                //borderColor: '#ccc',
                borderRadius: 15,
            }}
            onPress={() => { return }}
            mode='contained'
        >
            <Card.Content >
                <View style={{ ...ShiftsCardStyles.row }}>
                    <View style={{ width: syncUploadComplete ? '85%' : '100%' }}>
                        <Text
                            style={{
                                ...commonStyles.text,
                                color: lightTheme ? '#52525C' : 'black',
                                fontSize: 18,
                                textAlign: 'left',
                                marginLeft: 8,

                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {Strings.labels.Plot} : {item.plotselected}
                        </Text>
                    </View>
                    {syncUploadComplete && (
                        <View style={{
                            width: '15%',
                            marginLeft: 5,
                        }}>
                            <MCIcon name="wifi-sync" size={20} color="green" />
                        </View>
                    )}
                </View>

                <View style={{
                    flexDirection: 'column',
                    flexWrap: 'wrap',
                    width: '100%',
                    padding: 4,
                    paddingBottom: 0,
                }}>
                    <View style={{
                        flexDirection: 'column',
                        flexWrap: 'wrap',
                        width: '80%',
                        padding: 6,
                        paddingLeft: 4,
                        paddingBottom: 0,
                        backgroundColor: "#EBEBEB"
                    }}>
                        <Text style={{
                            fontSize: 15,
                            fontFamily: 'Inter-Regular',
                            color: 'black',
                            textAlign: 'left',
                            fontWeight: 'bold', color: lightTheme ? '#52525C' : 'black'
                        }}>{Strings.labels.Date} : {item.timestamp}</Text>
                        <Text style={{

                            fontFamily: 'Inter-Regular',
                            color: 'black',
                            textAlign: 'left',
                            fontWeight: 'bold', fontSize: 15, color: lightTheme ? '#52525C' : 'black'
                        }}>{Strings.labels.TimeTaken} : {item.starttime} to {item.endtime}</Text>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: lightTheme ? '#52525C' : 'black'
                        }}>{Strings.messages.ShiftType} : {item.shifttype}
                        </Text>
                        <Text style={{
                            fontSize: 22,
                            fontWeight: 'bold',
                            color: lightTheme ? '#52525C' : 'black'
                        }}>{Strings.messages.trees} : {item.treesplanted}
                        </Text>

                    </View>


                </View>
            </Card.Content>
        </Card >
    );
};



export default TreesInShiftHeader;
