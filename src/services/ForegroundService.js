import React, { useEffect } from 'react';
import { Button, View } from 'react-native';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';

export default function ForegroundService() {

    useEffect(() => {
        ReactNativeForegroundService.add_task(() => log(), {
            delay: 1000,
            onLoop: true,
            taskId: 1244,
            onError: e => console.log(`Error logging:`, e),
        });
    }, []);

    const startTask = () => {
        ReactNativeForegroundService.start({
            id: 1244,
            title: 'Image Foreground Service',
            message: 'Clicking the photo',
            icon: 'ic_launcher',
            button: true,
            button2: true,
            buttonText: 'Button',
            button2Text: 'Anther Button',
            buttonOnPress: 'cray',
            setOnlyAlertOnce: true,
            color: '#000000',
            progress: {
                max: 100,
                curr: 50,
            },
        });
    };

    const stopTask = () => {
        ReactNativeForegroundService.stopAll();
    };

    return (
        <View>
            <Button onPress={startTask} title="Start The foreground Service" />
            <Button onPress={stopTask} title="Stop The foreground Service" />
        </View>
    );
}

const log = () => console.log('clicking photo');