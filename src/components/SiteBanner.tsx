import { Banner, Text } from "react-native-paper";
import React, { useCallback, useState } from "react";
import { Site } from '../model/sites';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Constants } from '../services/Utils';
import { useFocusEffect } from "@react-navigation/native";

const SiteBanner: React.FC<{}> = () => {
    const [site, setSite] = useState<Site | null>(null)

    useFocusEffect(
        useCallback(() => {
            const getSiteInfo = async () => {
                const data = await AsyncStorage.getItem(Constants.selectedSite);
                if (data) {
                    const site = JSON.parse(data);
                    setSite(site);
                }
            }
            getSiteInfo();
            return () => {
                setSite(null);
            };
        }, [])
    );


    return (
        <Banner
            visible={site !== null}
        >
            <Text variant='bodyLarge' style={{ fontWeight: '700' }}>Selected Site: {'\n'}</Text>
            <Text variant='bodyMedium'>{site?.name_english + '\n'}</Text>
            <Text variant='bodyMedium'>{site?.name_marathi}</Text>
        </Banner>
    )
}

export default SiteBanner;