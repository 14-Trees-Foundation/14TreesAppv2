import MapView,{PROVIDER_GOOGLE,Marker} from "react-native-maps";
import Geolocation from "@react-native-community/geolocation"
import { Text, View,Alert,ToastAndroid,TextInput } from "react-native";
import { MyIcon, MyIconButton } from "./Components";
import { useEffect,useState } from "react";
import { Strings } from "./Strings";
import { Utils, commonStyles } from "./Utils";
const coordinateModes = {
    fixed:0,
    writeable:1,
    draggable:2
}
export const CoordinateSetter = ({inLat,inLng,onSetLat,onSetLng,editMode,setOuterScrollEnabled})=>{
    const [lat,setLat] = useState(inLat);
    const [lng,setLng] = useState(inLng);
    const [userLocation,setUserLocation] = useState({latitude:0,longitude:0});
    const [tmplat,setTmpLat] = useState(inLat);
    const [tmplng,setTmpLng] = useState(inLng);
    const [coordinatesMode,setCoordinatesMode] = useState(coordinateModes.fixed);
    const [accuracy,setAccuracy] = useState(0);
    const getReadableCoordinate = (lat)=>{
        const latval = Math.round(lat*10000)/10000
        return `${latval}`
    }
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
                Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.LocationError);
            },
            { enableHighAccuracy: false, timeout: 20000},
        );

    };

return <View style={{flexDirection:'column',padding:20}}>
    <Text style={{ color: 'black', fontSize: 18 }}> {Strings.languages.Location}: </Text>
        {
            [
            <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                <View>
                    <Text style={{...commonStyles.text3,textAlign:'center'}}>{getReadableLocation(lat,lng)}</Text>
                </View>
            <View style={{flexDirection:'row'}}>
            <MyIconButton name={"crosshairs-gps"}
            onPress={()=>Utils.confirmAction(()=>requestLocation(),'Refresh?','Set tree location current GPS coordinates?')}></MyIconButton>
            <MyIconButton name={"edit"}
            onPress={()=>{
                setCoordinatesMode(coordinateModes.writeable);
                setTmpLat(lat);
                setTmpLng(lng);
                }}></MyIconButton>
            <MyIconButton name={"hand-rock"}
            onPress={()=>{
                setCoordinatesMode(coordinateModes.draggable);
                setOuterScrollEnabled(false);
                setTmpLat(lat);
                setTmpLng(lng);
            }}></MyIconButton>
            </View>
            </View>
            ,
            <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                <View style={{flexDirection:'column'}}>
                <TextInput
                style={{...commonStyles.remark,height:35}}
                placeholder="Lat"
                keyboardType="numeric"
                onChangeText={(text)=>setTmpLat(Number.parseFloat(text))}
                defaultValue={(lat).toString()}
                />
                <TextInput
                style={{...commonStyles.remark,height:35}}
                placeholder="Long"
                keyboardType="numeric"
                onChangeText={(text)=>setTmpLng(Number.parseFloat(text))}
                defaultValue={(lng).toString()}
                />
                </View>
                <View style={{flexDirection:'row'}}>
                    <MyIconButton name={"check"}
                    onPress={
                        ()=>Utils.confirmAction(()=>{
                            onSetLat(tmplat);
                            setLat(tmplat);
                            onSetLng(tmplng);
                            setLng(tmplng);
                            setCoordinatesMode(coordinateModes.fixed);
                        },'Update?',"Set tree location to given coordinates?")
                    }></MyIconButton>
                    <MyIconButton name={"cancel"}
                    color="red"
                    onPress={()=>{
                        setCoordinatesMode(coordinateModes.fixed);
                        setTmpLat(lat);
                        setTmpLng(lng);
                        }}></MyIconButton>
                </View>
            </View>,
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                <View style={{flexDirection:'column'}}>
                <Text
                style={{...commonStyles.text3}}
                >
                Latitude: {getReadableCoordinate(tmplat)}
                </Text>
                <Text
                style={{...commonStyles.text3}}
                >
                Longitude: {getReadableCoordinate(tmplng)}
                </Text>
                </View>
                <View style={{flexDirection:'row'}}>
                    <MyIconButton name={"check"}
                    onPress={
                        ()=>Utils.confirmAction(()=>{
                            onSetLat(tmplat);
                            setLat(tmplat);
                            onSetLng(tmplng);
                            setLng(tmplng);
                            setCoordinatesMode(coordinateModes.fixed);
                        },'Update?',"Set tree location to dragged coordinates?")
                    }></MyIconButton>
                    <MyIconButton name={"cancel"}
                    color="red"
                    onPress={()=>{
                        setCoordinatesMode(coordinateModes.fixed);
                        setOuterScrollEnabled(true);
                        setTmpLat(lat);
                        setTmpLng(lng);
                        }}></MyIconButton>
                </View>
            </View>
        
            
        ][coordinatesMode]
        }
        <Text style={commonStyles.text3}>{Strings.languages.userLocation}: {getReadableLocation(userLocation.latitude,userLocation.longitude)}</Text>
    <MapView
    followsUserLocation={true}
    scrollEnabled={coordinatesMode!==coordinateModes.draggable}
    
    onMarkerDrag={(event)=>{
        let {latitude,longitude} = event.nativeEvent.coordinate;
        setTmpLat(latitude);
        setTmpLng(longitude);
    }}
    showsCompass={true}
    rotateEnabled={false}
    provider={PROVIDER_GOOGLE}
    style={{height:200,margin:10}}
    showsUserLocation={true}
    onUserLocationChange={(event)=>{
        let {latitude,longitude,accuracy} = event.nativeEvent.coordinate;
        setUserLocation({latitude,longitude})
        setAccuracy(accuracy)
    }}
    >
        {
            [
                <Marker coordinate={{ latitude: lat, longitude: lng }}>
                    <MyIcon name={'tree'} />
                </Marker>
                ,
                <Marker coordinate={{ latitude: tmplat, longitude: tmplng }}>
                    <MyIcon name={'tree'} />
                </Marker>
                ,
                <Marker coordinate={{ latitude: tmplat, longitude: tmplng }} draggable={true}>
                    <MyIcon name={'tree'} />
                </Marker>
            ][coordinatesMode]
        }
    </MapView>
</View>
}