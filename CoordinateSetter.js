import MapView,{PROVIDER_GOOGLE,Marker} from "react-native-maps";
import Geolocation from "@react-native-community/geolocation"
import { Text, View,Alert,ToastAndroid } from "react-native";
import { MyIconButton } from "./Components";
import { useEffect,useState } from "react";
import { Strings } from "./Strings";
import { Utils, commonStyles } from "./Utils";

export const CoordinateSetter = ({inLat,inLng,onSetLat,onSetLng,editMode})=>{
    const [lat,setLat] = useState(inLat);
    const [lng,setLng] = useState(inLng);
    const [accuracy,setAccuracy] = useState(0);
    const getReadableLocation = (lat,lng)=>{
        const latval = Math.round(lat*1000)/1000
        const lngval = Math.round(lng*1000)/1000
        return `${latval}, ${lngval}`
    }
    // useEffect(()=>{
        // requestLocation();
    // })
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
                console.log(error)
                if(error.code===error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE){
                    ToastAndroid.show('Error: Request timed out. GPS not available right now.',ToastAndroid.LONG);
                }
                // else if(error.code===error.PERMISSION_DENIED){
                else{
                    Alert.alert('Error','Have you turned on the location (GPS) on your phone?');
                }
            },
            { enableHighAccuracy: false, timeout: 20000},
        );

    };

return <View style={{flexDirection:'column',padding:20}}>
    <Text style={{ color: 'black', fontSize: 18 }}> {Strings.languages.Location}</Text>
    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
        <Text style={commonStyles.text3}>{getReadableLocation(lat,lng)}</Text>
        <View style={{flexDirection:'row'}}>
        <MyIconButton name={"refresh"} size={30}
        color={'green'} onPress={()=>Utils.confirmAction(()=>requestLocation(),'Refresh?','Update location current GPS coordinates?')}></MyIconButton>
        <MyIconButton name={"edit"} size={30}
        color={'green'} onPress={()=>{}}></MyIconButton>
        <MyIconButton name={"hand-rock"} size={30}
        color={'green'} onPress={()=>{}}></MyIconButton>
        </View>
    </View>
    {/* <MapView
    followsUserLocation={true}
    showsCompass={true}
    rotateEnabled={false}
    provider={PROVIDER_GOOGLE}
    style={{height:200,margin:10}}
    showsUserLocation={true}
    onUserLocationChange={(event)=>{
        let {latitude,longitude,accuracy} = event.nativeEvent.coordinate;
        setLat(latitude)
        onSetLat(latitude)
        setLng(longitude)
        onSetLng(longitude)
        setAccuracy(accuracy)
    }}
    >
        <Marker coordinate={{latitude:lat,longitude:lng}}>
        </Marker>
    </MapView> */}
</View>
}