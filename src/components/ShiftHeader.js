import { commonStyles } from '../services/Styles';
import GlobalContext from '../context/GlobalContext ';
import Timer from "../components/Timer";
import Sound from 'react-native-sound';
import Icon from 'react-native-vector-icons/FontAwesome5';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View, } from 'react-native';
import { Utils } from '../services/Utils';

const ShiftHeader = ({ onSetTime, handleModalChanges }) => {

    const { treesPlanted, shiftTime, setShiftTime, plotSelected, lightTheme, playSound, setPlaySound } = useContext(GlobalContext);

    const [showGradient, setShowGradient] = useState(false);

    //console.log("re-rending shift header");
    // Function to play background sound
    const playBackgroundSound = useCallback(() => {
        var sound = new Sound('livechat.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('failed to load the sound', error);
                return;
            }
            // loaded successfully
            console.log('duration in seconds: ' + sound.getDuration() + 'number of channels: ' + sound.getNumberOfChannels());

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
        //console.log("play the sound----", playSound);
        if (playSound) {
            handleSoundFunctionality();
            setPlaySound(false);
        }
    }, [playSound])




    const handleSoundFunctionality = () => {
        playBackgroundSound();

        // Show gradient for 1 second
        setShowGradient(true);
        setTimeout(() => setShowGradient(false), 500);
    }



    useEffect(() => {
        async function startTask() {

            const currentTime12Hr = Utils.getCurrentTime12Hr();
            setShiftTime(currentTime12Hr);
            console.log("currentTime12Hr: ", currentTime12Hr);
        }

        startTask();

    }, []);

    return (
        <View style={{
            backgroundColor: 'white',
            padding: 2, margin: 4, borderRadius: 10, borderColor: '#ccc', borderWidth: 3,
            //flex: 1, 
            //height: '100%'
        }}>

            <View style={{ margin: 4, borderRadius: 10, marginBottom: 0 }}>

                {
                    plotSelected && <TouchableOpacity
                        style={{ marginTop: 3 }}
                        onPress={() => { handleModalChanges(); }
                        }>

                        <Text
                            style={{
                                fontFamily: 'Inter-Regular',
                                fontWeight: 'bold',
                                color: lightTheme ? '#52525C' : 'black',
                                margin: 8,
                                fontSize: 18,
                                //opacity: 0.5,
                                textAlign: 'center',
                                marginTop: 1,
                                maxWidth: '100%',
                                overflow: 'hidden', // Ensure overflow is hidden
                                textDecorationLine: 'underline', // Add underline to make it look like a hyperlink
                            }}
                            numberOfLines={1} // Limit to a single line
                            ellipsizeMode="tail" // Truncate at the end with ellipsis
                        >
                            {plotSelected.name}
                        </Text>
                        
                    </TouchableOpacity>
                }


                <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: '100%', padding: 4 }}>
                    {/* First View */}

                    <View style={{
                        //flex: 1, 
                        flexDirection: 'column', flexWrap: 'wrap', width: '50%', marginBottom: 1, marginTop: 0
                    }}>
                        {/* Time View */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12, }}>
                            <View style={{ margin: 3, marginTop: 0 }}>
                                <Icon name="clock" size={15} color={lightTheme ? "#52525C" : 'black'} />
                            </View>
                            <Text style={{
                                fontSize: 18,
                                color: lightTheme ? '#52525C' : 'black',
                                fontFamily: 'Inter-Regular',
                                fontWeight: '700',
                                margin: 8,
                                marginTop: 0
                            }}>
                                {shiftTime}
                            </Text>
                        </View>

                        {/* Stopwatch View */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
                            <View style={{ margin: 3, marginTop: 0 }}>
                                <Icon name="stopwatch" size={15} color={lightTheme ? "#52525C" : 'black'} />
                            </View>
                            <View style={{ margin: 3, marginTop: 0 }}>
                                {/* <Timer /> */}
                                <View style={commonStyles.container}>
                                    <Timer onSetTime={onSetTime} />
                                </View>
                            </View>
                        </View>
                    </View>
                    {/* Second View */}

                    <View style={{ ...commonStyles.secondView, backgroundColor: showGradient ? 'lightgreen' : 'lightgrey', marginRight: 20, marginLeft: 22, width: '30%' }}>
                        {/* Icon */}
                        <View style={{ margin: 6, flex: 1 }}>
                            <View style={{ backgroundColor: 'green', borderRadius: 70, padding: 10, margin: 2 }}>
                                <Icon name="tree" size={32} color="white" style={{ marginLeft: 5 }} />
                            </View>
                        </View>

                        {/* TreesPlanted */}

                        <View style={{ flex: 1 }}>
                            <Text style={{
                                color: lightTheme ? '#52525C' : 'black',
                                fontSize: 18, fontWeight: 'bold', padding: 10, textAlign: 'center'
                            }}>
                                {treesPlanted}
                            </Text>
                        </View>

                    </View>
                </View>

            </View>


        </View>
    )
}

export default ShiftHeader;