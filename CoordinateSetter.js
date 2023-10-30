import MapView,{PROVIDER_GOOGLE,Marker} from "react-native-maps";
import Geolocation from "@react-native-community/geolocation"
import { Text, View } from "react-native";
import { MyIconButton } from "./Components";
import { useEffect } from "react";

export const CoordinateSetter = ({lat,lng,onSetLat,onSetLng,editMode})=>{

    const getReadableLocation = (lat,lng)=>{
        const latval = Math.round(lat*100)/100
        const lngval = Math.round(lng*100)/100
        return `${latval},${lngval}`
    }
    useEffect(()=>{
        requestLocation();
    })
    const requestLocation = async () => {
        console.log('requesting location');
        // TODO: handler
        Geolocation.getCurrentPosition(
            (position) => {
                onSetLat(position.coords.latitude);
                onSetLng(position.coords.longitude);
                console.log(lat);
                console.log(lng);
            },
            (error) => {
                Alert.alert('Error', 'Have you turned on the location (GPS) on your phone?');
            },
            { enableHighAccuracy: false, timeout: 2000 },
        );

    };

return <View style={{flexDirection:'column'}}>
    <View style={{flexDirection:'row'}}>
    <Text style={{ color: 'black', marginLeft: 20, margin: 10, fontSize: 18 }}> {Strings.languages.Location} : {getReadableLocation(lat,lng)}</Text>
    <MyIconButton name={"search-location"} size={30}
    color={'green'} onPress={()=>{}}></MyIconButton>
    <MyIconButton name={"edit"} size={30}
    color={'green'} onPress={()=>{}}></MyIconButton>
    </View>
    {/* {((lat+lng)>0 )&&<MapView
    showsCompass={true}
    rotateEnabled={false}
    provider={PROVIDER_GOOGLE}
    style={{height:200,margin:10}}
    showsUserLocation={true}
    region={{
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      }}
    >
        <Marker coordinate={{latitude:lat,longitude:lng}}>
        </Marker>
    </MapView>} */}
</View>
}