//import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation"
import { Text, View, Alert, ToastAndroid, TextInput, TouchableOpacity } from "react-native";
//import { CancelButton, MyIcon, SaveButton } from "./Components";
import { useCallback, useContext, useEffect, useState } from "react";
import { Strings } from "../services/Strings";
import { Utils } from "../services/Utils";
import { useFocusEffect } from "@react-navigation/native";
import { commonStyles } from "../services/Styles";
import GlobalContext from "../context/GlobalContext ";


const getReadableCoordinate = (lat) => {
    const latval = Math.round(lat * 10000) / 10000
    return `${latval}`
}

const isLocationAllowed = async () => {
    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
            (_) => {
                //location available, maps will use it to set tree location.
                resolve(true);
            },
            async (error) => {
                console.log("error fetching tree location---", error);
                const stackTrace = error.stack;

                const errorLog = {
                    msg: "happened while trying to fetch tree location and location permisson not given",
                    error: JSON.stringify(error),
                    stackTrace: stackTrace
                }

                await Utils.logException(JSON.stringify(errorLog));

                if (error.code === error.TIMEOUT) {
                    ToastAndroid.show(Strings.alertMessages.GPSUnavailable, ToastAndroid.LONG);
                }
                else if (error.code === error.POSITION_UNAVAILABLE) {
                    resolve(false);
                }
                resolve(true);//location turned on, but error anyways.
            },
            { enableHighAccuracy: false, timeout: 20000 },
        );
    })
}

const requestLocation = async (onSetLat, onSetLng, setLat, setLng) => {
    //console.log('requesting location');
    Geolocation.getCurrentPosition(
        (position) => {
            onSetLat(position.coords.latitude);
            onSetLng(position.coords.longitude);
            setLat(position.coords.latitude);
            setLng(position.coords.longitude);
        },
        (error) => {
            console.log(error)
            if (error.code === error.TIMEOUT) {
                ToastAndroid.show(Strings.alertMessages.GPSUnavailable, ToastAndroid.LONG);
            }
            else {
                Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.LocationError);
            }

        },
        { enableHighAccuracy: false, timeout: 20000 },
    );

};


export const CoordinateSetter = ({ inLat, inLng, onSetLat, onSetLng, changeCordinate, onChangeCordinate }) => {
    const [lat, setLat] = useState(inLat);
    const [lng, setLng] = useState(inLng);
    const { lightTheme } = useContext(GlobalContext);

    //console.log("incoming lat and lng---", inLat, inLng, lat , lng);
    useEffect(() => {
        //console.log("changes in cordinate setter", inLat, inLng);
        if (changeCordinate) {
            setLat(0);
            setLng(0);
            onChangeCordinate();
        }
    }, [changeCordinate])

    useFocusEffect(useCallback(() => {
        isLocationAllowed().then((locationOn) => {
            if (!locationOn) {
                console.log(Strings.alertMessages.Error, Strings.alertMessages.LocationError, "happended -----");
                Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.LocationError);
            }
        });
    }, [isLocationAllowed]))


    const CoordinatesDisplay = ({ latitude, longitude, title }) => {
        //console.log("latitude---", latitude, 'longitude---', longitude);
        return (
            <View style={{ marginTop: 15, borderRadius: 12, padding: 8, flexDirection: 'column', backgroundColor: '#e8e9ea' }}>
                <Text style={{
                    ...commonStyles.text3, color: lightTheme ? '#52525C' : 'black',
                    fontSize: 18,
                    fontFamily: 'Inter-Regular', fontWeight: 'bold', marginTop: 0
                }}>
                    {title}:
                </Text>
                <Text
                    style={{
                        ...commonStyles.text3, color: lightTheme ? '#52525C' : 'black',
                        fontFamily: 'Inter-Regular',
                        marginTop: 0
                    }}
                >
                    Latitude: {getReadableCoordinate(latitude)}
                </Text>
                <Text
                    style={{
                        ...commonStyles.text3, color: lightTheme ? '#52525C' : 'black',
                        fontFamily: 'Inter-Regular',
                        marginTop: 0
                    }}
                >
                    Longitude: {getReadableCoordinate(longitude)}
                </Text>
            </View>
        )
    }

    return (
        <View style={{ flexDirection: 'column', padding: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                <TouchableOpacity style={{ flexDirection: 'column' }}
                    onPress={() => requestLocation(onSetLat, onSetLng, setLat, setLng)}
                >
                    <CoordinatesDisplay latitude={lat} longitude={lng} title={Strings.messages.Location} />
                </TouchableOpacity>
            </View>
        </View>
    )
}