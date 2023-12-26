import MapView,{PROVIDER_GOOGLE,Marker} from "react-native-maps";
import Geolocation from "@react-native-community/geolocation"
import { Text, View,Alert,ToastAndroid,TextInput } from "react-native";
import { CancelButton, MyIcon, MyIconButton, SaveButton } from "./Components";
import { useCallback, useEffect,useState } from "react";
import { Strings } from "../services/Strings";
import { LOGTYPES, Utils, commonStyles } from "../services/Utils";
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
const getLocationUsingGeoLocation = async()=>{
    return new Promise((resolve,reject)=>{
        Geolocation.getCurrentPosition(
            (position) => {
                //position available, maps will use it to set tree position.
                resolve({
                    latitude:position.coords.latitude,
                    longitude:position.coords.longitude,
                    accuracy:position.coords.accuracy
                });
            },
            (error) => {
                console.log(error)
                if(error.code===error.TIMEOUT){
                    ToastAndroid.show(Strings.alertMessages.GPSUnavailable,ToastAndroid.LONG);
                    reject({timeout:true});
                    return;
                }
                else if(error.code === error.POSITION_UNAVAILABLE){
                    reject({positionUnavailable:true});
                    return;
                }
                Utils.storeLog(LOGTYPES.GPS_ERROR,JSON.stringify(error));
                reject(error);
                //location turned on, but error anyways.
            },
            { enableHighAccuracy: false, timeout: 10000},
        );
    })
}
const isLocationAllowed = async()=>{
    let locationAllowed = true;
    try{
        await getLocationUsingGeoLocation();
    }
    catch(err){
        if(err.positionUnavailable){
            locationAllowed = false;
        }
    }
    return locationAllowed;
}
const requestLocation = async (userLocation) => {
    // console.log('requesting location');
    let position = {latitude:0,longitude:0}
    let positionAvailable = await isLocationAllowed();
    if(!positionAvailable){
        locationNeededAlert(() => requestLocation(userLocation));
        return null;//handle null return.
    }
    let geolocationPosition = {latitude:0,longitude:0,accuracy:Infinity}
    let userLocationValid = userLocation.latitude+userLocation.longitude>0
    
    //positionAvailable
    try{
        geolocationPosition = await getLocationUsingGeoLocation();
        position = {latitude:geolocationPosition.latitude,
                    longitude:geolocationPosition.longitude}
        if(userLocationValid && userLocation.accuracy < geolocationPosition.accuracy){
            position = {latitude:userLocation.latitude,
                        longitude:userLocation.longitude};
        }
        console.log('geo: ',geolocationPosition)
        console.log('user: ',userLocation)
    }
    catch(err){
        if(userLocationValid){
            //user maps position. as good as geolocation.
            position = {latitude:userLocation.latitude,longitude:userLocation.longitude};
        }
        else if(err.timeout){
            //inform user:
            ToastAndroid.show(Strings.alertMessages.GPSUnavailable,ToastAndroid.LONG);
            //request location again.
            return await requestLocation(userLocation);
        }
        else{
            ToastAndroid.show(Strings.alertMessages.GPSUnavailable,ToastAndroid.LONG);
            //logging handled by requestFunction.
        }
    }
    return position;

};
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
export const pointToRegion = (location)=>({
    ...location,
    latitudeDelta:coordinateDelta,
    longitudeDelta:coordinateDelta
});
export const locationAvailabilityCheck = ()=>{
    isLocationAllowed().then((available)=>{
        if(available){
            return true;
        }
        else{
            return locationNeededAlert(()=>locationAvailabilityCheck());
        }
    });
}
//TODO: consolidated formLocationSetterFunction, combining mapview user location and geolocationapi.
export const CoordinateSetter = ({inLat,inLng,onSetLat,onSetLng,setInitLocation,setOuterScrollEnabled,plotId,sessionId})=>{
    const [formLocation,setFormLocation] = useState({latitude:inLat,longitude:inLng});
    const [userLocation,setUserLocation] = useState({latitude:0,longitude:0,accuracy:Infinity});
    const [markerLocation,setMarkerLocation] = useState({latitude:0,longitude:0})
    const [tmpLocation,setTmpLocation] = useState({latitude:inLat,longitude:inLng});
    const [markerMoving,setMarkerMoving]=useState(false);
    const [coordinatesMode,setCoordinatesMode] = useState(coordinateModes.fixed);
    const [showPlotSaplings,setShowPlotSaplings] = useState(false);
    const [plotSaplings,setPlotSaplings] = useState([]);
    const [visibleSaplingsRegion,setVisibleSaplingsRegion] = useState(null);
    const [visibleSaplings,setVisibleSaplings] = useState([]);

    useFocusEffect(useCallback(()=>{
        locationAvailabilityCheck()
    },[isLocationAllowed]))
    useEffect(()=>{
        //reset location values for each new session.
        setUserLocation({latitude:0,longitude:0,accuracy:Infinity});
        setMarkerLocation({latitude:0,longitude:0});
        setFormLocation({latitude:inLat,longitude:inLat});
        setTmpLocation({latitude:inLat,longitude:inLng});
    },[sessionId])
    useEffect(()=>{
        if(setInitLocation && (formLocation.latitude+formLocation.longitude==0)){
            requestLocation(userLocation).then((position)=>{
                if(position!==null){
                    setFormLocation(position);
                    onSetLat(position.latitude);
                    onSetLng(position.longitude);
                }
            });
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
        setVisibleSaplingsRegion(pointToRegion(formLocation));
    },[formLocation])
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
        {/* <MyIconButton name={'refresh'} text={Strings.alertMessages.refresh} /> */}
        <CoordinatesDisplay latitude={formLocation.latitude} longitude={formLocation.longitude} title={Strings.messages.Location}/>
        <CoordinatesDisplay latitude={userLocation.latitude} longitude={userLocation.longitude} title={Strings.messages.userLocation}/>
        </View>
    
        <View style={{flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <MyIconButton name={"crosshairs-gps"} text={Strings.buttonLabels.gps}
        onPress={()=>Utils.confirmAction(async()=>{
            let position = await requestLocation(userLocation);
            if(position!==null){
                setFormLocation(position);
                onSetLat(position.latitude);
                onSetLng(position.longitude);
            }
        }
            ,undefined,Strings.messages.confirmSetGPS)}/>
        <MyIconButton name={"edit"} text={Strings.buttonLabels.edit}
        onPress={()=>{
            setCoordinatesMode(coordinateModes.writeable);
            setTmpLocation(formLocation);
            }}/>
        <MyIconButton name={"hand-rock"} text={Strings.buttonLabels.drag}
        onPress={()=>{
            setMarkerLocation(formLocation);
            setCoordinatesMode(coordinateModes.draggable);
            setOuterScrollEnabled(false);
            setTmpLocation(formLocation);
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
            onChangeText={(text)=>setTmpLocation({...tmpLocation,latitude:safeParse(text,formLocation.latitude)})}
            defaultValue={(formLocation.latitude).toString()}
            />
            </View>
            <View style={{flexDirection:'row',alignItems:'center'}}>
            <Text style={commonStyles.text3}>Longitude: </Text>
            <TextInput
            style={{...commonStyles.remark,margin:0,height:30}}
            placeholder="Long"
            keyboardType="numeric"
            onChangeText={(text)=>setTmpLocation({...tmpLocation,longitude:safeParse(text,formLocation.longitude)})}
            defaultValue={(formLocation.longitude).toString()}
            />
            </View>
            </View>
            <CoordinatesDisplay latitude={userLocation.latitude} longitude={userLocation.longitude} title={Strings.messages.userLocation}/>

            </View>
            <View style={{flexDirection:'column'}}>
                <SaveButton onPress={
                    ()=>Utils.confirmAction(()=>{
                        onSetLat(tmpLocation.latitude);
                        onSetLng(tmpLocation.longitude);
                        setFormLocation(tmpLocation);
                        setCoordinatesMode(coordinateModes.fixed);
                    },undefined,Strings.messages.confirmCoordinateEdit)
                }/>
                <CancelButton onPress={()=>{
                    setCoordinatesMode(coordinateModes.fixed);
                    setTmpLocation(formLocation);
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
                    <CoordinatesDisplay latitude={tmpLocation.latitude} longitude={tmpLocation.longitude} title={Strings.messages.Location}/>
                }
                <CoordinatesDisplay latitude={userLocation.latitude} longitude={userLocation.longitude} title={Strings.messages.userLocation}/>
            </View>
            
            <View style={{flexDirection:'column'}}>
                <SaveButton
                onPress={()=>Utils.confirmAction(()=>{
                    onSetLat(tmpLocation.latitude);
                    onSetLng(tmpLocation.longitude);
                    setFormLocation(tmpLocation);
                    setCoordinatesMode(coordinateModes.fixed);
                    setOuterScrollEnabled(true);
                },undefined,Strings.messages.confirmDrag)}
                />
                <CancelButton
                onPress={
                    ()=>{
                        setCoordinatesMode(coordinateModes.fixed);
                        setOuterScrollEnabled(true);
                        setTmpLocation(formLocation);
                    }
                }
                />
            </View>
        </View>
    ][coordinatesMode]
    }
    <MapView
    // cacheEnabled={true}
    region={pointToRegion(formLocation)}
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
        setTmpLocation({latitude,longitude});
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
        setUserLocation({latitude,longitude,accuracy})
    }}
    >
        {
            [
                <Marker coordinate={formLocation}>
                    <MyIcon name={'tree'} />
                </Marker>
                ,
                <Marker coordinate={tmpLocation}>
                    <MyIcon name={'tree'} />
                </Marker>
                ,
                <Marker coordinate={tmpLocation} draggable={true}>
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

function locationNeededAlert(refreshCallback) {
    Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.LocationError, [
        {
            text: Strings.alertMessages.refresh,
            onPress: refreshCallback
        },
        {
            text: Strings.alertMessages.continueWithoutLocation,
            onPress: () => {
                //dismiss
            }
        }
    ], {
        cancelable: false,
    });
}
