import React, { useEffect } from 'react';
import { Text, Image, View, BackHandler, StyleSheet } from 'react-native';
import { aboutStyles } from '../services/Styles';

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
                Sapling Upload App
            </Text>
            <Text style={aboutStyles.text}>Version 2.4.1</Text>
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
