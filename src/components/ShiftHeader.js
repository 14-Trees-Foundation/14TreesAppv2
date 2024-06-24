import { commonStyles, shiftHeaderStyles, treeFormModalStyles } from '../services/Styles';
import GlobalContext from '../context/GlobalContext ';
import Timer from "../components/Timer";
import Sound from 'react-native-sound';
import Icon from 'react-native-vector-icons/FontAwesome5';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, } from 'react-native';
import { Utils } from '../services/Utils';
import { Strings } from '../services/Strings';

const ShiftHeader = ({ onSetTime, handleModalChanges }) => {

    const { treesPlanted, shiftTime, setShiftTime, plotSelected, lightTheme, playSound, setPlaySound } = useContext(GlobalContext);

    const [showGradient, setShowGradient] = useState(false);

    const playBackgroundSound = useCallback(() => {
        var sound = new Sound('livechat.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('failed to load the sound', error);
                return;
            }

            //console.log('duration in seconds: ' + sound.getDuration() + 'number of channels: ' + sound.getNumberOfChannels());

            // Play the sound with an onEnd callback
            sound.play((success) => {
                if (success) {
                    console.log('successfully finished playing');
                } else {
                    console.log('playback failed due to audio decoding errors');
                }
            });
        });
    }, []);

    useEffect(() => {
        if (playSound) {
            handleSoundFunctionality();
            setPlaySound(false);
        }
    }, [playSound])

    useEffect(() => {
        setShiftTime(Utils.getCurrentTime12Hr());
    }, []);


    const handleSoundFunctionality = () => {
        playBackgroundSound();
        // Show gradient for 1 second
        setShowGradient(true);
        setTimeout(() => setShowGradient(false), 500);
    }



    return (

        <View style={{
            //...shiftHeaderStyles.outerContainer, 
            marginHorizontal: 10,
            backgroundColor: '#F5F5F5',
            padding: 10,
            borderRadius: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
        }}>
            <View style={{
                //shiftHeaderStyles.innerContainer
                flexDirection: 'row',
                //justifyContent: 'center',
                alignItems: 'center',
                //marginBottom: 10,
                //marginLeft: 10,
                // gap: 30
            }}>
                <Text
                    style={{
                        fontFamily: 'Inter-Regular',
                        fontWeight: 'bold',
                        color: lightTheme ? '#52525C' : 'black',
                        margin: 8,
                        fontSize: 20,
                        marginTop: 5,
                    }}
                >
                    {Strings.messages.Plot}
                </Text>
                <View
                    style={{
                        maxWidth: '100%',
                        marginRight: 21
                    }}
                >
                    {
                        plotSelected && <TouchableOpacity
                            //style={{maxWidth: '100%'}}
                            onPress={() => { handleModalChanges(); }
                            }>
                            <Text
                                style={{
                                    ...shiftHeaderStyles.plotName(lightTheme),
                                    maxWidth: '100%',
                                    marginLeft: 29
                                }}
                                numberOfLines={1} // Limit to a single line
                                ellipsizeMode="tail" // Truncate at the end with ellipsis
                            >
                                {plotSelected.name}
                            </Text>

                        </TouchableOpacity>
                    }
                </View>
            </View>




            <View style={{ ...shiftHeaderStyles.shiftDetailsContainer, padding: 0 }}>

                <View style={{ ...shiftHeaderStyles.shiftDetailsView, width: '60%', marginBottom: 0 }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        //marginBottom: 5,
                        //width: '60%'
                    }}>
                        <Text style={{
                            //shiftHeaderStyles.shiftTime(lightTheme)
                            fontFamily: 'Inter-Regular',
                            fontWeight: 'bold',
                            color: lightTheme ? '#52525C' : 'black',
                            marginLeft: 8,
                            fontSize: 20,
                            //marginTop: 5,
                        }}>
                            {Strings.labels.StartTime}
                        </Text>

                        <Text style={{
                            //shiftHeaderStyles.shiftTime(lightTheme)
                            fontFamily: 'Inter-Regular',
                            fontWeight: 'bold',
                            color: lightTheme ? '#52525C' : 'black',
                            //margin: 8,
                            fontSize: 17,
                            //marginTop: 5,
                        }}>
                            {shiftTime}
                        </Text>
                    </View>

                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        //marginBottom: 5,
                        //width: '60%'
                    }}>
                        <Text style={{
                            //shiftHeaderStyles.shiftTime(lightTheme)
                            fontFamily: 'Inter-Regular',
                            fontWeight: 'bold',
                            color: lightTheme ? '#52525C' : 'black',
                            marginLeft: 8,
                            fontSize: 20,
                            //marginTop: 5,
                        }}>
                            {Strings.labels.TimeTaken}
                        </Text>

                        <Text style={{
                            //shiftHeaderStyles.shiftTime(lightTheme)
                            fontFamily: 'Inter-Regular',
                            fontWeight: 'bold',
                            color: lightTheme ? '#52525C' : 'black',
                            //margin: 8,
                            fontSize: 17,
                            //marginTop: 5,
                        }}>
                            <Timer onSetTime={onSetTime} />
                        </Text>
                    </View>
                </View>


                <View style={{
                    ...shiftHeaderStyles.treeDetailsContainer(showGradient),
                    //marginTop: 7,
                    //marginLeft: 32, 
                    //height: 70,
                    flex: 1,
                    borderRadius: 10,
                }}>
                    <View style={{ margin: 6, flex: 1, }}>

                        <View
                        //style={shiftHeaderStyles.iconContainer}
                        >
                            <Image source={require('../../assets/tree.png')}
                                style={{
                                    marginTop: 2,
                                    height: 32,
                                    width: 32
                                }}
                            />
                        </View>
                    </View>
                    <View >
                        <Text style={{ ...shiftHeaderStyles.treeCount(lightTheme), marginTop: 2, marginRight: 2 }}>
                            {treesPlanted}
                        </Text>
                    </View>
                </View>
            </View>

        </View >

    )
}

export default ShiftHeader;

