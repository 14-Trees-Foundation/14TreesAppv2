import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';

const StartScreen = () => {
    return (
        <View style={styles.container}>
            <Animatable.Image
                animation="pulse"
                easing="ease-out"
                iterationCount="infinite"
                source={require('../../assets/logo.png')} // Replace 'your-logo.png' with the path to your logo file
                style={styles.logo}
            />
            <Text style={{ marginTop: 20, fontSize: 30, fontWeight: 'bold', color: 'black' }}>14 Trees</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    logo: {
        width: 200,
        height: 200,
    },
});

export default StartScreen;
