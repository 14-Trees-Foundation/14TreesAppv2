import React, { useEffect } from 'react';
import { Text, Image, View, BackHandler } from 'react-native';

const About = ({ navigation }) => {

    useEffect(() => {
        const backAction = () => {
            navigation.goBack()
            return true; // Prevent default behavior (exit app)
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, [])

    return (
        <View
            style={{ backgroundColor: 'white', padding: 40, alignItems: 'center' }}>
            <Text
                style={{
                    color: '#0F4334',
                    fontSize: 22,
                    fontWeight: 'bold',
                    paddingBottom: 5,
                }}>
                Sapling Upload App
            </Text>
            <Text style={{ color: '#0F4334', fontSize: 18, paddingBottom: 15 }}>Version 2.2</Text>
            <View>
                <Image
                    source={require('../../assets/logo.png')}
                    style={{ width: 100, height: 100, }}
                />
            </View>
            <Text style={{ color: '#0F4334', fontSize: 18, padding: 15 }}>14 Trees Org.</Text>
        </View>
    );
};

export default About;
