import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Callout, KmlMapEvent, LatLng, MapMarker, MapPressEvent, Marker, MarkerDragStartEndEvent, Polygon, UserLocationChangeEvent } from "react-native-maps";
import { Text } from "react-native-paper";
import { DaoClient } from "../services/db/dao";
import { makeMutable } from "react-native-reanimated";

const boundaries: Location[] = [
    {
        longitude: 73.77285450362623,
        latitude: 18.92518422398344
    },
    {
        longitude: 73.77282623118357,
        latitude: 18.92522621997616
    },
    {
        longitude: 73.77282133637596,
        latitude: 18.92526385235402
    },
    {
        longitude: 73.77276205240535,
        latitude: 18.92535790898204
    },
    {
        longitude: 73.77269061339545,
        latitude: 18.92543652085708
    },
    {
        longitude: 73.77264437867238,
        latitude: 18.92545361297476
    },
    {
        longitude: 73.77259121498065,
        latitude: 18.92548666862078
    },
    {
        longitude: 73.77255359271267,
        latitude: 18.92547477820353
    },
    {
        longitude: 73.77255736037661,
        latitude: 18.92545164555718
    },
    {
        longitude: 73.77253586426036,
        latitude: 18.92543423628121
    },
    {
        longitude: 73.77246241450463,
        latitude: 18.92539789442547
    },
    {
        longitude: 73.77242085628514,
        latitude: 18.92541278377427
    },
    {
        longitude: 73.7722927256448,
        latitude: 18.9253601758723
    },
    {
        longitude: 73.77218853761413,
        latitude: 18.9253341722819
    },
    {
        longitude: 73.77225324146039,
        latitude: 18.92530886442278
    },
    {
        longitude: 73.77229301650324,
        latitude: 18.92531687197494
    },
    {
        longitude: 73.77235971145069,
        latitude: 18.925321606593
    },
    {
        longitude: 73.77241401075716,
        latitude: 18.92531407398686
    },
    {
        longitude: 73.77246378761424,
        latitude: 18.92529292249666
    },
    {
        longitude: 73.77252892756144,
        latitude: 18.92525185286155
    },
    {
        longitude: 73.77262461724905,
        latitude: 18.92517132922493
    },
    {
        longitude: 73.77268484873031,
        latitude: 18.92509361204812
    },
    {
        longitude: 73.77273128612809,
        latitude: 18.92501512841722
    },
    {
        longitude: 73.77275602607588,
        latitude: 18.92495892162952
    },
    {
        longitude: 73.77277286826984,
        latitude: 18.92491962821201
    },
    {
        longitude: 73.77285450362623,
        latitude: 18.92518422398344
    },    
]

interface Location {
    latitude: number,
    longitude: number
}

interface MarkerType {
    ref: any,
    title: string
    location: Location
}

const MapScreen = () => {
    const [location, setLocation] = useState<Location | null>(null);
    const [userLocation, setUserLocation] = useState<Location | null>({
        latitude: 18.925298,
        longitude: 73.7726301,
    });
    const [markers, setMarkers] = useState<MarkerType[]>([])
    const markerRefs = useRef<(MapMarker | null)[]>([]);
    const markerRef = useRef<(MapMarker | null)>(null);

    useEffect(() => {
        // markerRefs.current.forEach((marker, index) => {
        //     if (marker) {
        //         console.log(marker)
        //         marker.showCallout();
        //     }
        // })
        
        setTimeout(() => {
            markerRefs.current[0]?.showCallout()
        }, 10)
        setTimeout(() => {
            markerRefs.current[1]?.showCallout()
        }, 5000)
        setTimeout(() => {
            markerRefs.current[2]?.showCallout()
        }, 10000)
        // console.log(markerRefs.current[0])
    }, [markerRefs])

    const handlePress = (event: MapPressEvent) => {
        console.log(event.nativeEvent.coordinate);
        setLocation(event.nativeEvent.coordinate)
    }

    const handleMarkerDrag = (event: MarkerDragStartEndEvent) => {
        console.log(event.nativeEvent.coordinate);
        setLocation(event.nativeEvent.coordinate)
    }

    useEffect(() => {
        const getTreeLocations = async () => {
            const plotId: number = 2974;
            const daoClient = await DaoClient.authenticate();
            const trees = await daoClient.trees.getTrees(0, 200, undefined, false, plotId);
            const markers: MarkerType[] = []
            trees.forEach(tree => {
                if (tree.location) {
                    const coordinates = JSON.parse(tree.location).coordinates;
                    markers.push({
                        title: tree.sapling_id,
                        location: { latitude: coordinates[0], longitude: coordinates[1] }
                    } as MarkerType)
                }
            })
            setMarkers(markers);
        }

        getTreeLocations();
    }, [])

    // const handleUserLocation = (event: UserLocationChangeEvent) => {
    //     setUserLocation(event.nativeEvent.coordinate || null);
    // }   

    // const handleKml = (event: KmlMapEvent) => {
    //     setMarkers(event.nativeEvent.markers)
    // }

    return (
        <View style={{ flex: 1 }}>
            <MapView
                style={StyleSheet.absoluteFill}
                showsUserLocation
                followsUserLocation
                mapType="satellite"
                initialRegion={userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude, latitudeDelta: 0.001, longitudeDelta: 0.001 } : undefined}
                // onUserLocationChange={handleUserLocation}
                onPress={handlePress}
            // kmlSrc={markers.length === 0 ? "https://drive.google.com/uc?export=download&id=1_wSv5V0-lvkhCSAfYPS01URpHvpRA5xy" : undefined}
            // onKmlReady={markers.length === 0 ? handleKml : undefined}
            >
                <Polygon 
                    coordinates={boundaries}
                    fillColor="400055ff"
                />
                {location && <Marker
                    draggable
                    title="Pressed"
                    coordinate={location}
                    onDragEnd={handleMarkerDrag}
                    ref={markerRef}
                />}

                {markers.map((marker, index) => (
                    <Marker
                        draggable
                        key={marker.title}
                        title={marker.title}
                        description="123"
                        coordinate={marker.location}
                        ref={(ref) => markerRefs.current[index]=ref}
                    >
                        <Callout tooltip >
                            <View style={{ padding: 5 }}>
                                <Text style={{ color: 'white' }}>{marker.title}</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>
        </View>
    );
}

export default MapScreen;