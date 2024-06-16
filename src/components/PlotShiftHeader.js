import { commonStyles, shiftHeaderStyles } from '../services/Styles';
import GlobalContext from '../context/GlobalContext ';
import Timer from "../components/Timer";
import Sound from 'react-native-sound';
import Icon from 'react-native-vector-icons/FontAwesome5';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View, } from 'react-native';
import { Utils } from '../services/Utils';

const PlotShiftHeader = ({ onSetTime, handleModalChanges }) => {

    const { treesPlanted, shiftTime, setShiftTime, plotSelected, newPlotSelected, lightTheme, playSound, setPlaySound } = useContext(GlobalContext);

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

        <View style={shiftHeaderStyles.outerContainer}>
            <View style={shiftHeaderStyles.innerContainer}>

                {
                    plotSelected && <TouchableOpacity
                        style={{ marginTop: 3 }}
                        onPress={() => { handleModalChanges(); }
                        }>

                        <Text
                            style={shiftHeaderStyles.plotName(lightTheme)}
                            numberOfLines={1} // Limit to a single line
                            ellipsizeMode="tail" // Truncate at the end with ellipsis
                        >
                            {plotSelected.name}
                        </Text>

                    </TouchableOpacity>
                }

                <View style={{ flexDirection: 'row' , justifyContent : 'center' }}>
                    <Icon name="arrow-down" size={15} color={lightTheme ? "#52525C" : 'black'} />
                </View>
                {
                    newPlotSelected && <TouchableOpacity
                        style={{ marginTop: 3 }}
                        onPress={() => { handleModalChanges(); }
                        }>

                        <Text
                            style={shiftHeaderStyles.plotName(lightTheme)}
                            numberOfLines={1} // Limit to a single line
                            ellipsizeMode="tail" // Truncate at the end with ellipsis
                        >
                             {newPlotSelected.name}
                        </Text>

                    </TouchableOpacity>
                }

                <View style={shiftHeaderStyles.shiftDetailsContainer}>
                    <View style={shiftHeaderStyles.shiftDetailsView}>
                        <View style={shiftHeaderStyles.innerView}>
                            <View style={{ margin: 3, marginTop: 0 }}>
                                <Icon name="clock" size={15} color={lightTheme ? "#52525C" : 'black'} />
                            </View>
                            <Text style={shiftHeaderStyles.shiftTime(lightTheme)}>
                                {shiftTime}
                            </Text>
                        </View>


                        <View style={shiftHeaderStyles.innerView}>
                            <View style={{ margin: 3, marginTop: 0 }}>
                                <Icon name="stopwatch" size={15} color={lightTheme ? "#52525C" : 'black'} />
                            </View>
                            <View style={{ margin: 3, marginTop: 0 }}>
                                <View style={commonStyles.container}>
                                    <Timer onSetTime={onSetTime} />
                                </View>
                            </View>
                        </View>
                    </View>


                    <View style={shiftHeaderStyles.treeDetailsContainer(showGradient)}>
                        <View style={{ margin: 6, flex: 1, }}>
                            <View style={shiftHeaderStyles.iconContainer}>
                                <Icon name="tree" size={32} color="white" style={{ marginLeft: 7 }} />
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={shiftHeaderStyles.treeCount(lightTheme)}>
                                {treesPlanted}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>

    )
}

export default PlotShiftHeader;