import MapView,{PROVIDER_GOOGLE,Marker} from "react-native-maps";
import Geolocation from "@react-native-community/geolocation"
import { Text, View,Alert,ToastAndroid,TextInput } from "react-native";
import { CancelButton, MyIcon, MyIconButton, SaveButton } from "./Components";
import { useEffect,useState } from "react";
import { Strings } from "./Strings";
import { Utils, commonStyles } from "./Utils";
//TODO:
//1. Text in all buttons related to coordinates.
//2. Button no.4 to view/hide other trees in the plot.
//3. Other trees must be displayed with title and different color marker.
const coordinateModes = {
    fixed:0,
    writeable:1,
    draggable:2
}
const safeParse = (text,defaultValue=0)=>{
    let num = Number.parseFloat(text);
    return isNaN(num)?defaultValue:num;
}
const getReadableCoordinate = (lat)=>{
    const latval = Math.round(lat*10000)/10000
    return `${latval}`
}
const getReadableLocation = (lat,lng)=>{
    const latval = Math.round(lat*1000)/1000
    const lngval = Math.round(lng*1000)/1000
    return `${latval}, ${lngval}`
}
export const CoordinatesDisplay = ({latitude,longitude,title})=>{
    return (
                <View style={{flexDirection:'column',borderColor:'grey',borderWidth:3,borderRadius:5,margin:3,padding:3}}>
                    <Text style={{...commonStyles.text3,fontWeight:'bold'}}>
                        {title}:
                    </Text>
                    <Text
                    style={{...commonStyles.text3}}
                    >
                    Latitude: {getReadableCoordinate(latitude)}
                    </Text>
                    <Text
                    style={{...commonStyles.text3}}
                    >
                    Longitude: {getReadableCoordinate(longitude)}
                    </Text>
                </View>
                )
}
export const CoordinateSetter = ({inLat,inLng,onSetLat,onSetLng,editMode,setOuterScrollEnabled})=>{
    const [lat,setLat] = useState(inLat);
    const [lng,setLng] = useState(inLng);
    const [markerMoving,setMarkerMoving]=useState(false);
    const [userLocation,setUserLocation] = useState({latitude:0,longitude:0});
    const [markerLocation,setMarkerLocation] = useState({latitude:0,longitude:0})
    const [tmplat,setTmpLat] = useState(inLat);
    const [tmplng,setTmpLng] = useState(inLng);
    const [coordinatesMode,setCoordinatesMode] = useState(coordinateModes.fixed);
    const [accuracy,setAccuracy] = useState(0);
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
        
    {
        [
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-around'}}>
        <View style={{flexDirection:'column'}}>
        <CoordinatesDisplay latitude={lat} longitude={lng} title={Strings.languages.Location}/>
        <CoordinatesDisplay {...userLocation} title={Strings.languages.userLocation}/>
        </View>
    
        <View style={{flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <MyIconButton name={"crosshairs-gps"} text={"GPS"}
        onPress={()=>Utils.confirmAction(()=>requestLocation(),'Refresh?','Set tree location current GPS coordinates?')}></MyIconButton>
        <MyIconButton name={"edit"} text={"Edit"}
        onPress={()=>{
            setCoordinatesMode(coordinateModes.writeable);
            setTmpLat(lat);
            setTmpLng(lng);
            }}></MyIconButton>
        <MyIconButton name={"hand-rock"} text={"Drag"}
        onPress={()=>{
            setMarkerLocation({latitude:lat,longitude:lng});
            setCoordinatesMode(coordinateModes.draggable);
            setOuterScrollEnabled(false);
            setTmpLat(lat);
            setTmpLng(lng);
        }}></MyIconButton>
            </View>
        </View>
        ,
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-around'}}>
            <View style={{flexDirection:'column'}}>
            <View style={{flexDirection:'column',borderColor:'grey',borderWidth:3,borderRadius:5,margin:3,padding:3}}>
            <Text style={{...commonStyles.text3}}>
                {Strings.languages.Location}
            </Text>
            <View style={{flexDirection:'row',alignItems:'center'}}>
            <Text style={commonStyles.text3}>Latitude: </Text>
            <TextInput
            style={{...commonStyles.remark,height:30}}
            placeholder="Lat"
            keyboardType="numeric"
            onChangeText={(text)=>setTmpLat(safeParse(text,lat))}
            defaultValue={(lat).toString()}
            />
            </View>
            <View style={{flexDirection:'row',alignItems:'center'}}>
            <Text style={commonStyles.text3}>Longitude: </Text>
            <TextInput
            style={{...commonStyles.remark,margin:0,height:30}}
            placeholder="Long"
            keyboardType="numeric"
            onChangeText={(text)=>setTmpLng(safeParse(text,lng))}
            defaultValue={(lng).toString()}
            />
            </View>
            </View>
            <CoordinatesDisplay {...userLocation} title={Strings.languages.userLocation}/>

            </View>
            <View style={{flexDirection:'column'}}>
                <SaveButton onPress={
                    ()=>Utils.confirmAction(()=>{
                        onSetLat(tmplat);
                        setLat(tmplat);
                        onSetLng(tmplng);
                        setLng(tmplng);
                        setCoordinatesMode(coordinateModes.fixed);
                    },'Update?',"Set tree location to given coordinates?")
                }/>
                <CancelButton onPress={()=>{
                    setCoordinatesMode(coordinateModes.fixed);
                    setTmpLat(lat);
                    setTmpLng(lng);
                }}/>
            </View>
        </View>
        ,
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-around'}}>
            <View style={{flexDirection:'column'}}>
                {
                    markerMoving
                    ?
                    <CoordinatesDisplay {...markerLocation} title={Strings.languages.Location}/>
                    :
                    <CoordinatesDisplay latitude={tmplat} longitude={tmplng} title={Strings.languages.Location}/>
                }
                <CoordinatesDisplay {...userLocation} title={Strings.languages.userLocation}/>
            </View>
            
            <View style={{flexDirection:'column'}}>
                <SaveButton
                onPress={()=>Utils.confirmAction(()=>{
                    onSetLat(tmplat);
                    setLat(tmplat);
                    onSetLng(tmplng);
                    setLng(tmplng);
                    setCoordinatesMode(coordinateModes.fixed);
                    setOuterScrollEnabled(true);
                },'Update?',"Set tree location to dragged coordinates?")}
                />
                <CancelButton
                onPress={
                    ()=>{
                        setCoordinatesMode(coordinateModes.fixed);
                        setOuterScrollEnabled(true);
                        setTmpLat(lat);
                        setTmpLng(lng);
                    }
                }
                />
            </View>
        </View>
    ][coordinatesMode]
    }
    <MapView
    followsUserLocation={true}
    scrollEnabled={coordinatesMode!==coordinateModes.draggable}
    onMarkerDragStart={(event)=>{
        setMarkerMoving(true);
    }}
    onMarkerDragEnd={(event)=>{
        let {latitude,longitude} = event.nativeEvent.coordinate;
        setTmpLat(latitude);
        setTmpLng(longitude);
        setMarkerMoving(false);
    }}
    onMarkerDrag={(event)=>{
        let {latitude,longitude} = event.nativeEvent.coordinate;
        setMarkerLocation({latitude,longitude});
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
                //TODO: new variables for marker lat and marker lng
                <Marker coordinate={{ latitude: tmplat, longitude: tmplng }} draggable={true}>
                    <MyIcon name={'tree'} />
                </Marker>
            ][coordinatesMode]
        }
    </MapView>
</View>
}