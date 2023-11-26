import MapView,{PROVIDER_GOOGLE,Marker} from "react-native-maps";
import Geolocation from "@react-native-community/geolocation"
import { Text, View,Alert,ToastAndroid,TextInput } from "react-native";
import { CancelButton, MyIcon, MyIconButton, SaveButton } from "./Components";
import { useCallback, useEffect,useState } from "react";
import { Strings } from "./Strings";
import { Utils, commonStyles } from "./Utils";
import { useFocusEffect } from "@react-navigation/native";
const coordinateDelta = 0.002;
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
const isLocationAllowed = async()=>{
    return new Promise((resolve,reject)=>{
        Geolocation.getCurrentPosition(
            (_) => {
                //location available, maps will use it to set tree location.
                resolve(true);
            },
            (error) => {
                console.log(error)
                if(error.code===error.TIMEOUT){
                    ToastAndroid.show(Strings.alertMessages.GPSUnavailable,ToastAndroid.LONG);
                }
                else if(error.code === error.POSITION_UNAVAILABLE){
                    resolve(false);
                }
                resolve(true);//location turned on, but error anyways.
            },
            { enableHighAccuracy: false, timeout: 20000},
        );
    })
}
const requestLocation = async (onSetLat,onSetLng,setLat,setLng) => {
    // console.log('requesting location');
    Geolocation.getCurrentPosition(
        (position) => {
            onSetLat(position.coords.latitude);
            onSetLng(position.coords.longitude);
            setLat(position.coords.latitude);
            setLng(position.coords.longitude);
        },
        (error) => {
            console.log(error)
            if(error.code===error.TIMEOUT){
                ToastAndroid.show(Strings.alertMessages.GPSUnavailable,ToastAndroid.LONG);
            }
            else{
                Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.LocationError);
            }

        },
        { enableHighAccuracy: false, timeout: 20000},
    );

};
const useMapViewUserLocation = async(setLat,setLng,onSetLat,onSetLng,coords)=>{
    onSetLat(coords.latitude);
    onSetLng(coords.longitude);
    setLat(coords.latitude);
    setLng(coords.longitude);
}
export const CoordinatesDisplay = ({latitude,longitude,title})=>{
    return (
                <View style={{...commonStyles.borderedDisplay,flexDirection:'column'}}>
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
export const pointToRegion = (lat,lng)=>({
    latitude:lat,
    longitude:lng,
    latitudeDelta:coordinateDelta,
    longitudeDelta:coordinateDelta
});
export const CoordinateSetter = ({inLat,inLng,onSetLat,onSetLng,setInitLocation,setOuterScrollEnabled,plotId})=>{
    const [lat,setLat] = useState(inLat);
    const [lng,setLng] = useState(inLng);
    const [markerMoving,setMarkerMoving]=useState(false);
    const [userLocation,setUserLocation] = useState({latitude:0,longitude:0});
    const [markerLocation,setMarkerLocation] = useState({latitude:0,longitude:0})
    const [tmplat,setTmpLat] = useState(inLat);
    const [tmplng,setTmpLng] = useState(inLng);
    const [coordinatesMode,setCoordinatesMode] = useState(coordinateModes.fixed);
    const [showPlotSaplings,setShowPlotSaplings] = useState(false);
    const [plotSaplings,setPlotSaplings] = useState([]);
    const [visibleSaplingsRegion,setVisibleSaplingsRegion] = useState(null);
    const [visibleSaplings,setVisibleSaplings] = useState([]);
    useFocusEffect(useCallback(()=>{
        isLocationAllowed().then((locationOn)=>{
            if(!locationOn){
                Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.LocationError);
            }
        });
    },[isLocationAllowed]))
    useEffect(()=>{
        if(setInitLocation){
            if(lat+lng==0){
                useMapViewUserLocation(setLat,setLng,onSetLat,onSetLng,userLocation)
            }
        }
    },[userLocation])
    useEffect(()=>{
        if(plotId){
            Utils.getPlotSaplings(plotId).then((saplings)=>{
                setPlotSaplings(saplings);
            })
        }
    },[plotId])
    useEffect(()=>{
        setVisibleSaplingsRegion(pointToRegion(lat,lng));
    },[lat,lng])
    useEffect(()=>{
        if(showPlotSaplings){
            let saplingsToShow = plotSaplings.filter((sapling)=>{
                const withinLat = Math.abs(sapling.lat-visibleSaplingsRegion.latitude) < visibleSaplingsRegion.latitudeDelta;
                const withinLng = Math.abs(sapling.lng-visibleSaplingsRegion.longitude) < visibleSaplingsRegion.longitudeDelta;
                return withinLat && withinLng;
            });
            setVisibleSaplings(saplingsToShow);
        }
        else{
            setVisibleSaplings([]);
        }
    },[showPlotSaplings,visibleSaplingsRegion,plotSaplings]);
return <View style={{flexDirection:'column',padding:20}}>
        
    {
        [
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-around'}}>
        <View style={{flexDirection:'column'}}>
        <CoordinatesDisplay latitude={lat} longitude={lng} title={Strings.messages.Location}/>
        <CoordinatesDisplay {...userLocation} title={Strings.messages.userLocation}/>
        </View>
    
        <View style={{flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <MyIconButton name={"crosshairs-gps"} text={Strings.buttonLabels.gps}
        onPress={()=>Utils.confirmAction(()=>{
            if(userLocation.latitude+userLocation.longitude>0){
                useMapViewUserLocation(setLat,setLng,onSetLat,onSetLng,userLocation)
            }
            else{
                requestLocation(onSetLat,onSetLng,setLat,setLng);
            }
        }
            ,undefined,Strings.messages.confirmSetGPS)}/>
        <MyIconButton name={"edit"} text={Strings.buttonLabels.edit}
        onPress={()=>{
            setCoordinatesMode(coordinateModes.writeable);
            setTmpLat(lat);
            setTmpLng(lng);
            }}/>
        <MyIconButton name={"hand-rock"} text={Strings.buttonLabels.drag}
        onPress={()=>{
            setMarkerLocation({latitude:lat,longitude:lng});
            setCoordinatesMode(coordinateModes.draggable);
            setOuterScrollEnabled(false);
            setTmpLat(lat);
            setTmpLng(lng);
        }}/>
        <MyIconButton
            names={["forest",showPlotSaplings?"eye-slash":"eye"]}
            sizes={[30,20]}
            styles={[{opacity:0.5,fontSize:10},{opacity:0.9}]}
            text={showPlotSaplings?Strings.buttonLabels.hideAll:Strings.buttonLabels.showAll}
            onPress={()=>{
                if(plotId===undefined){
                    Alert.alert(Strings.alertMessages.selectPlotFirst,'');
                }
                else{
                    setShowPlotSaplings(!showPlotSaplings);
                }

            }}
        />
        </View>
        </View>
        ,
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-around'}}>
            <View style={{flexDirection:'column'}}>
            <View style={{flexDirection:'column',borderColor:'grey',borderWidth:3,borderRadius:5,margin:3,padding:3}}>
            <Text style={{...commonStyles.text3}}>
                {Strings.messages.Location}
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
            <CoordinatesDisplay {...userLocation} title={Strings.messages.userLocation}/>

            </View>
            <View style={{flexDirection:'column'}}>
                <SaveButton onPress={
                    ()=>Utils.confirmAction(()=>{
                        onSetLat(tmplat);
                        setLat(tmplat);
                        onSetLng(tmplng);
                        setLng(tmplng);
                        setCoordinatesMode(coordinateModes.fixed);
                    },undefined,Strings.messages.confirmCoordinateEdit)
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
                    <CoordinatesDisplay {...markerLocation} title={Strings.messages.Location}/>
                    :
                    <CoordinatesDisplay latitude={tmplat} longitude={tmplng} title={Strings.messages.Location}/>
                }
                <CoordinatesDisplay {...userLocation} title={Strings.messages.userLocation}/>
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
                },undefined,Strings.messages.confirmDrag)}
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
    // cacheEnabled={true}
    region={pointToRegion(lat,lng)}
    onRegionChangeComplete={(event)=>{
        setVisibleSaplingsRegion(event);
    }}
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
        {
            visibleSaplings.map((sapling,index)=>(
                            <Marker key={index} title="" coordinate={{latitude:sapling.lat,longitude:sapling.lng}}>
                                <MyIcon name={'tree'} color="yellow"/>
                                <Text style={commonStyles.text6}>{sapling.saplingid}</Text>                      
                            </Marker>))
        }
    </MapView>
</View>
}