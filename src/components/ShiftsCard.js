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
                backgroundColor: '#F3F4F6',
                borderRadius: 15,
                marginVertical: 7,
                marginHorizontal: 15,
                shadowColor: lightTheme ? '#000' : '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                elevation: 8,
            }}
            onPress={handlePress}
            mode='contained'
        >
            <Card.Content>

                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                    paddingBottom: 5
                }}>
                    <View style={{ width: '15%' }}>
                        <Text
                            style={{
                                ...commonStyles.text,
                                color: 'black',
                                fontSize: 17,
                                //textAlign: 'left',
                                //marginLeft: 8,

                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {Strings.messages.Plot}
                        </Text>
                    </View>

                    <View style={{ width: syncUploadComplete ? '65%' : '75%', }}>
                        <Text
                            style={{
                                ...commonStyles.text,
                                color:  'black',
                                fontSize: 17,
                                textAlign: 'left',
                                marginLeft: 25,
                                fontWeight: "600"

                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {item.plotselected}
                        </Text>
                    </View>


                    {syncUploadComplete && (
                        <View style={{
                            width: '10%',
                            // marginRight: 35,
                        }}>
                            <MCIcon name="wifi-sync" size={20} color="green" />
                        </View>
                    )}

                </View>




                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingBottom: 5
                }}>
                    <View style={{ width: '15%' }}>
                        <Text
                            style={{
                                ...commonStyles.text,
                                color:  'black',
                                fontSize: 17,
                                textAlign: 'left',
                                //marginLeft: 8,

                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {Strings.labels.Date}
                        </Text>
                    </View>

                    <View style={{ width: '100%', }}>
                        <Text
                            style={{
                                ...commonStyles.text,
                                color:  'black',
                                fontSize: 17,
                                textAlign: 'left',
                                marginLeft: 25,
                                fontWeight: "600"

                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {item.timestamp}
                        </Text>
                    </View>
                </View>

                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingBottom: 5
                }}>
                    <View style={{ width: '15%' }}>
                        <Text
                            style={{
                                ...commonStyles.text,
                                color:  'black',
                                fontSize: 17,
                                textAlign: 'left',
                                //marginLeft: 8,

                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {Strings.labels.Time}
                        </Text>
                    </View>

                    <View style={{ width: '100%', }}>
                        <Text
                            style={{
                                ...commonStyles.text,
                                color: 'black',
                                fontSize: 17,
                                textAlign: 'left',
                                marginLeft: 25,
                                fontWeight: "600"

                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {item.starttime} to {item.endtime}
                        </Text>
                    </View>
                </View>


                <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    borderRadius: 8,
                    padding: 6,
                    margin: 5,
                    marginLeft:0,
                    borderWidth: 1,
                    borderColor: "#5CC17B",
                    width: "87%"
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
                        color: '#333333'
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




            </Card.Content>
        </Card >
    );
};



export default ShiftsCard;
