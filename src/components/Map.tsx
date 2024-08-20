import React from "react";
import { SafeAreaView } from "react-native";
import { Map } from "./map/Map";

export const MapScreen: React.FC<{}> = () => {

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Map />
        </SafeAreaView>
    );
}