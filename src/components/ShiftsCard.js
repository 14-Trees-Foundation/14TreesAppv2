import React, { useContext } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ShiftsCardStyles, commonStyles } from '../services/Styles';
import { Strings } from '../services/Strings';
import GlobalContext from '../context/GlobalContext ';

const ShiftsCard = ({ item, disableHandlePress }) => {

    const navigation = useNavigation();

    const { lightTheme } = useContext(GlobalContext);
    const syncUploadComplete = (item.shiftuploadcomplete == 1);

    const handlePress = () => {
        if (disableHandlePress) {
            return;
        }

        navigation.navigate(
            Strings.screenNames.getString('TreesInShift', Strings.english),
            {
                shiftIDs: { liveShiftId: item.shift_id, localShiftId: item.id },
                itemData: item
            }
        );

    };

    return (
        <Card
            style={{
                flex: 1,
                flexDirection: 'row',

                // justifyContent: 'center',
                backgroundColor: '#EBEBEB',
                opacity: 0.9,
                borderRadius: 3,
                marginVertical: 7,
                marginHorizontal: 15,
                //borderWidth: 2,
                //borderColor: '#ccc',
                borderRadius: 15,
            }}
            onPress={handlePress}
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
                            {Strings.messages.Plot} : {item.plotselected}
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
                }}>
                    <View style={{
                        flexDirection: 'column',
                        flexWrap: 'wrap',
                        width: '60%',
                        marginLeft: 2,
                        padding: 5
                    }}>
                        <Text style={{
                            fontSize: 14,
                            fontFamily: 'Inter-Regular',
                            color: 'black',
                            textAlign: 'left',
                            fontWeight: 'bold', color: lightTheme ? '#52525C' : 'black'
                        }}>{Strings.labels.Date} : {item.timestamp}</Text>
                        {/* <Text style={{ ...ShiftsCardStyles.detailText, color: lightTheme ? '#52525C' : 'black' }}>{Strings.labels.StartTime} : {item.starttime}</Text>
                        <Text style={{ ...ShiftsCardStyles.detailText, color: lightTheme ? '#52525C' : 'black' }}>{Strings.labels.EndTime} : {item.endtime}</Text> */}
                        <Text style={{ ...ShiftsCardStyles.detailText, color: lightTheme ? '#52525C' : 'black' }}>{Strings.labels.TimeTaken} : {item.starttime} to {item.endtime}</Text>
                    </View>

                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        fontFamily: 'Inter-Regular',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        alignItems: 'center',
                        //width: '50%',
                        backgroundColor: 'white',
                        marginRight: 5,
                        marginLeft: 5,
                        width: '100%',
                        borderRadius: 8,
                        paddingRight: 2,
                        borderWidth: 1,
                        borderColor: "#5CC17B"
                    }}>
                        <View style={{
                            margin: 6,
                            flex: 1,
                            marginTop: 7,
                            marginLeft: 11,
                            marginRight: 1,

                        }}>
                            <View style={{
                                flex: 1,
                                backgroundColor: 'white',
                                borderRadius: 7,
                                margin: 2,
                                marginBottom: 4,
                                marginTop: 0,
                                // width: 55,
                                height: 30,
                                flexDirection: "row"

                            }}>
                                <Image
                                    source={require('../../assets/tree.png')}
                                    style={{
                                        height: 35, width: 35
                                    }}
                                />

                                <Text style={{

                                    fontSize: 26,
                                    fontWeight: 'bold',
                                    marginLeft: 8,
                                    color: lightTheme ? '#52525C' : 'black'
                                }}>{item.treesplanted} {Strings.messages.trees}
                                </Text>

                                <View style={{ flex: 1, marginTop: 2, marginLeft: 0, alignItems: "flex-end" }}>
                                    <Image
                                        source={require('../../assets/icon-pencil.png')}
                                        style={{
                                            height: 27, width: 27
                                        }}
                                    />
                                </View>

                            </View>

                        </View>


                    </View>



                </View>
            </Card.Content>
        </Card >
    );
};



export default ShiftsCard;
