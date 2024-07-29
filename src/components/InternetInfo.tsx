import NetInfo from '@react-native-community/netinfo';
import { Banner, Text } from "react-native-paper";
import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

const InternetBanner: React.FC<{}> = () => {
    const [hasInternet, setHasInternet] = useState(false);
    useFocusEffect(
        useCallback(() => {
        const netInfoSubscription = NetInfo.addEventListener((state) => {
            if (state.isConnected !== null) setHasInternet(state.isConnected);
        });
        return () => {
            netInfoSubscription();
        };
        }, [])
    );


    return (
        <Banner
            visible={!hasInternet}
            actions={[
                {
                    label: 'Ok',
                    onPress: () => setHasInternet(true),
                },
            ]}
            icon='wifi-off'
        >
            <Text variant='titleSmall'>This device is not connected to network!</Text>
        </Banner>
    )
}

export default InternetBanner;