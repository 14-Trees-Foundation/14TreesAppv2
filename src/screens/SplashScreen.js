import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { splashScreenStyles } from '../services/Styles';

const SplashScreen = () => {
    return (
        <View style={splashScreenStyles.container}>
            <Animatable.Image
                animation="pulse"
                easing="ease-out"
                iterationCount="infinite"
                source={require('../../assets/logo.png')}
                style={splashScreenStyles.logo}
            />
            <Text style={{ marginTop: 20, fontSize: 30, fontWeight: 'bold', color: 'black' }}>14 Trees</Text>
        </View>
    );
};



export default SplashScreen;
