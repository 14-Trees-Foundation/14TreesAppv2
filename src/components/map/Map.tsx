import { FC } from "react";
import { View } from "react-native";
import MapView, { Marker } from "react-native-maps";


export const Map: FC<{}> = () => {

    return (
        <View>
            <MapView
                initialRegion={{
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                <Marker
                    draggable
                    coordinate={{
                        latitude: 37.78825,
                        longitude: -122.4324,
                    }}
                    title={'Test Marker'}
                    description={'This is a description of the marker'}
                />
            </MapView>
        </View>
    )
}