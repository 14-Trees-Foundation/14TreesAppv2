import React, { useState, useEffect, useContext } from 'react';
import { Text, View } from 'react-native';
import GlobalContext from '../context/GlobalContext ';
import { commonStyles } from '../services/Styles';


const Timer = ({ onSetTime }) => {
    const { lightTheme } = useContext(GlobalContext);

    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds(prevSeconds => prevSeconds + 1);
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);



    const formatTime = (timeInSeconds) => {
        onSetTime(timeInSeconds);
        const minutes = Math.floor(timeInSeconds / 60);
        const remainingSeconds = timeInSeconds % 60;
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
        }
        return `${minutes}m ${remainingSeconds}s`;
    };

    return (
        <View style={commonStyles.container}>
            <Text style={{ ...commonStyles.timerText, color: lightTheme ? '#52525C' : 'black' }}>
                {`( ${formatTime(seconds)} )`}
            </Text>
        </View>
    );
};


export default Timer;
