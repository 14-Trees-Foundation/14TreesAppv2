import { Banner, Text } from "react-native-paper";
import React, { useCallback, useState } from "react";
import { LocationSite, Site } from '../model/sites';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Constants } from '../services/Utils';
import { useFocusEffect } from "@react-navigation/native";

const SiteBanner: React.FC<{}> = () => {
    const [site, setSite] = useState<LocationSite | null>(null)

    useFocusEffect(
        useCallback(() => {
            const getSiteInfo = async () => {
                const data = await AsyncStorage.getItem(Constants.selectedSite);
                if (data) {
                    const raw = JSON.parse(data);
                    const site: LocationSite = {
                        ...raw,
                        location_name: raw.location_name ?? raw.name_english ?? '',
                        display_name: raw.display_name ?? raw.name_marathi ?? null,
                    };
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
            <Text variant='bodyMedium'>{site?.location_name + '\n'}</Text>
            <Text variant='bodyMedium'>{site?.display_name ?? ''}</Text>
        </Banner>
    )
}

export default SiteBanner;