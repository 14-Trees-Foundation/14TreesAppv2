import React, { useContext } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ShiftsCardStyles } from '../services/Styles';
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
            style={ShiftsCardStyles.card}
            onPress={handlePress}
        >
            <Card.Content>
                <View style={ShiftsCardStyles.row}>
                    <View style={{ width: syncUploadComplete ? '85%' : '100%' }}>
                        <Text
                            style={ShiftsCardStyles.plotSelectedText(lightTheme)}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {item.plotselected}
                        </Text>
                    </View>
                    {syncUploadComplete && (
                        <View style={ShiftsCardStyles.syncIconContainer}>
                            <MCIcon name="wifi-sync" size={20} color="green" />
                        </View>
                    )}
                </View>

                <View style={ShiftsCardStyles.detailsContainer}>
                    <View style={ShiftsCardStyles.detailsColumn}>
                        <Text style={{ ...ShiftsCardStyles.detailText, color: lightTheme ? '#52525C' : 'black' }}>{Strings.labels.Date} : {item.timestamp}</Text>
                        <Text style={{ ...ShiftsCardStyles.detailText, color: lightTheme ? '#52525C' : 'black' }}>{Strings.labels.StartTime} : {item.starttime}</Text>
                        <Text style={{ ...ShiftsCardStyles.detailText, color: lightTheme ? '#52525C' : 'black' }}>{Strings.labels.EndTime} : {item.endtime}</Text>
                        <Text style={{ ...ShiftsCardStyles.detailText, color: lightTheme ? '#52525C' : 'black' }}>{Strings.labels.TimeTaken} : {item.timetaken}</Text>
                    </View>

                    <View style={ShiftsCardStyles.treeContainer}>
                        <View style={ShiftsCardStyles.iconContainer}>
                            <View style={ShiftsCardStyles.treeIcon}>
                                <Icon name="tree" size={32} color="white" />
                            </View>
                        </View>

                        <View style={ShiftsCardStyles.treeCountContainer}>
                            <Text style={{ ...ShiftsCardStyles.treeCount, color: lightTheme ? '#52525C' : 'black' }}>{item.treesplanted}</Text>
                        </View>
                    </View>


                </View>
            </Card.Content>
        </Card>
    );
};



export default ShiftsCard;
