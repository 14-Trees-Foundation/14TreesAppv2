import MapView,{PROVIDER_GOOGLE,Marker} from "react-native-maps";
import Geolocation from "@react-native-community/geolocation"
import { Text, View } from "react-native";
import { MyIconButton } from "./Components";
import { useEffect,useState } from "react";
import { Strings } from "./Strings";
import { commonStyles } from "./Utils";

export const CoordinateSetter = ({inLat,inLng,onSetLat,onSetLng,editMode})=>{
    const [lat,setLat] = useState(inLat);
    const [lng,setLng] = useState(inLng);
    const [accuracy,setAccuracy] = useState(0);
    const getReadableLocation = (lat,lng)=>{
        const latval = Math.round(lat*1000)/1000
        const lngval = Math.round(lng*1000)/1000
        return `${latval}, ${lngval}`
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
                setLat(position.coords.latitude);
                setLng(position.coords.longitude);
                setAccuracy(position.coords.accuracy);
            },
            (error) => {
                Alert.alert('Error', 'Have you turned on the location (GPS) on your phone?');
            },
            { enableHighAccuracy: true, timeout: 2000 },
        );

    };

return <View style={{flexDirection:'column',padding:20}}>
    <Text style={{ color: 'black', fontSize: 18 }}> {Strings.languages.Location}</Text>
    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
        <Text style={commonStyles.text3}>{getReadableLocation(lat,lng)}</Text>
        <View style={{flexDirection:'row'}}>
        <MyIconButton name={"refresh"} size={30}
        color={'green'} onPress={()=>{}}></MyIconButton>
        <MyIconButton name={"edit"} size={30}
        color={'green'} onPress={()=>{}}></MyIconButton>
        <MyIconButton name={"hand-rock"} size={30}
        color={'green'} onPress={()=>{}}></MyIconButton>
        </View>
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
        latitudeDelta:0.001,
        longitudeDelta:0.001
      }}
    >
        <Marker coordinate={{latitude:lat,longitude:lng}}>
        </Marker>
    </MapView>} */}
</View>
}