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
                backgroundColor: 'white',
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
                                color: lightTheme ? '#333' : 'black',
                                fontSize: 20,
                                textAlign: 'left',
                                marginLeft: 8,

                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {Strings.labels.Plot} : {item.plot_selected}
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
                        // backgroundColor: "#EBEBEB"
                    }}>
                        <View style={{ flex: 1, flexDirection: 'row', paddingBottom: 5, }}>
                            <Text style={{
                                fontSize: 15,
                                fontFamily: 'Inter-Regular',
                                color: 'black',
                                textAlign: 'left',
                                fontWeight: 'bold', color: lightTheme ? '#333' : 'black'
                            }}>{Strings.labels.Date} :
                            </Text>

                            <Text style={{
                                fontSize: 15,
                                fontFamily: 'Inter-Regular',
                                color: 'black',
                                textAlign: 'left',
                                marginLeft: 20,
                                fontWeight: '600', color: lightTheme ? '#333' : 'black'
                            }}>
                                {item.timestamp}
                            </Text>
                        </View>

                        <View style={{ flex: 1, flexDirection: 'row', paddingBottom: 5, }}>
                            <Text style={{
                                fontSize: 15,
                                fontFamily: 'Inter-Regular',
                                color: 'black',
                                textAlign: 'left',
                                fontWeight: 'bold', color: lightTheme ? '#333' : 'black'
                            }}>{Strings.labels.Time} :
                            </Text>

                            <Text style={{
                                fontSize: 15,
                                fontFamily: 'Inter-Regular',
                                color: 'black',
                                textAlign: 'left',
                                marginLeft: 20,
                                fontWeight: '600', color: lightTheme ? '#333' : 'black'
                            }}>
                                {item.start_time} to {item.end_time}
                            </Text>
                        </View>

                        <View style={{ flex: 1, flexDirection: 'row', paddingBottom: 5, }}>
                            <Text style={{
                                fontSize: 15,
                                fontFamily: 'Inter-Regular',
                                color: 'black',
                                textAlign: 'left',
                                fontWeight: 'bold', color: lightTheme ? '#333' : 'black'
                            }}>{Strings.messages.ShiftType} :
                            </Text>

                            <Text style={{
                                fontSize: 15,
                                fontFamily: 'Inter-Regular',
                                color: 'black',
                                textAlign: 'left',
                                marginLeft: 20,
                                fontWeight: '600', color: lightTheme ? '#333' : 'black'
                            }}>
                                {item.shift_type}
                            </Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row', paddingBottom: 5, }}>
                            <Text style={{
                                fontSize: 15,
                                fontFamily: 'Inter-Regular',
                                color: 'black',
                                textAlign: 'left',
                                fontWeight: 'bold', color: lightTheme ? '#333' : 'black'
                            }}>{Strings.messages.Trees} :
                            </Text>

                            <Text style={{
                                fontSize: 15,
                                fontFamily: 'Inter-Regular',
                                color: 'black',
                                textAlign: 'left',
                                marginLeft: 20,
                                fontWeight: '600', color: lightTheme ? '#333' : 'black'
                            }}>
                                {item.trees_planted}
                            </Text>
                        </View>

                    </View>


                </View>
            </Card.Content>
        </Card >
    );
};



export default TreesInShiftHeader;
