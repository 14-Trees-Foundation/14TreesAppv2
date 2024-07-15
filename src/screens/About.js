import React, { useEffect } from 'react';
import { Text, Image, View, BackHandler, StyleSheet } from 'react-native';
import { aboutStyles } from '../services/Styles';
import { APP_VERSION } from '../constants/constants';

const About = ({ navigation }) => {

    useEffect(() => {
        const backAction = () => {
            navigation.goBack()
            return true; 
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, [])

    return (
        <View
            style={aboutStyles.outerView}>
            <Text
                style={aboutStyles.appName}>
                14Trees Onsite App
            </Text>
            <Text style={aboutStyles.text}>Version {APP_VERSION}</Text>
            <View>
                <Image
                    source={require('../../assets/logo.png')}
                    style={{ width: 100, height: 100, }}
                />
            </View>
            <Text style={aboutStyles.text}>14 Trees Org.</Text>
        </View>
    );
};



export default About;
