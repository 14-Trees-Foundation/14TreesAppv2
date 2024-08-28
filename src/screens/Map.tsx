import { useEffect, useRef, useState } from "react";
import { StyleSheet, ToastAndroid, View } from "react-native";
import MapView, { MapPressEvent, Marker, MarkerDragStartEndEvent, Polygon, Region } from "react-native-maps";
import { FAB, Icon, Text } from "react-native-paper";
import { DaoClient } from "../services/db/dao";
import { TreeForm } from "../components/trees/NewTreeForm";
import { CreateTreeRequest, Tree } from "../model/tree";
import { TreeImageType } from "../model/tree_image";
import { Plot } from "../model/plot";

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
    title: string
    location: Location
    isNew: boolean
}

const MapScreen = () => {
    const mapRef = useRef<MapView>(null);
    const [capturedCoords, setCapturedCords] = useState<Location | null>(null);
    const [centerCords, setCenterCords] = useState<Location | null>(null);
    const [userLocation, setUserLocation] = useState<Location | null>({
        latitude: 18.925298,
        longitude: 73.7726301,
    });
    const [markers, setMarkers] = useState<MarkerType[]>([]);
    const [visibleCallout, setVisibleCallout] = useState(false);
    const [showTarget, setShowTarget] = useState(false);
    const [treeModal, setTreeModal] = useState(false);
    const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);

    const handlePress = (event: MapPressEvent) => {
        const cords = event.nativeEvent.coordinate;
        setCapturedCords(cords);
    }

    const handleMarkerDrag = (event: MarkerDragStartEndEvent) => {
        // console.log(event.nativeEvent.coordinate)
        // setLocation(event.nativeEvent.coordinate)
    }

    const handleMapMovement = (region: Region) => {
        setCenterCords({
            latitude: region.latitude,
            longitude: region.longitude
        })
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
                        location: { latitude: coordinates[0], longitude: coordinates[1] },
                        isNew: !tree.is_uploaded
                    } as MarkerType)
                }
            })
            setMarkers(markers);

            const plot = await daoClient.plots.getPlotByLiveId(plotId);
            setSelectedPlot(plot);
        }

        getTreeLocations();
    }, [])

    const toggleCallout = () => {
        setVisibleCallout(prev => !prev);
    }

    const handleAddTreeMarker = () => {
        if (showTarget) {
            setShowTarget(false);
            setTreeModal(true);
        } else {
            setShowTarget(true);
        }
    }

    const treeSave = (data: Tree | CreateTreeRequest, images?: any) => {
        let hasError = false;
        const saveTreeData = async () => {
            const daoClient = await DaoClient.authenticate();
            data = JSON.parse(JSON.stringify(data)) as CreateTreeRequest;
            try {
                const success = await daoClient.trees.createTree(data)
                if (success) {
                    ToastAndroid.show("Added Tree Locally!", ToastAndroid.SHORT);
                    centerCords && setMarkers(prev => [ ...prev, { title: data.sapling_id, location: centerCords, isNew: true } ])
                } else {
                    ToastAndroid.show("Tree with given sapling id already exists!", ToastAndroid.LONG)
                    hasError = true;
                }
            } catch (err: any) {
                hasError = true;
                console.log(err)
                ToastAndroid.show("Failed to add tree locally!", ToastAndroid.SHORT)
            }
            

            const upsertImage = async (type: TreeImageType) => {
                if (images[type]) {
                    try {
                        await daoClient.treeImages.upsertTreeImage({
                            name: images[type].name,
                            data: images[type].data,
                            sapling_id: data.sapling_id,
                            type: type,
                            is_active: null,
                            user_id: null,
                        })
                    } catch (err: any) {
                        ToastAndroid.show(`Failed to add ${type.replace('_', ' ')} locally!`, ToastAndroid.SHORT)
                    }
                }
            }

            if (!hasError) {
                upsertImage('tree_image')
                upsertImage('user_card_image')
                upsertImage('user_tree_image')
                ToastAndroid.show("Updated Tree images locally!", ToastAndroid.SHORT)
            }
        }

        saveTreeData();
    };

    return (
        <View style={{ flex: 1, }}>
            {!treeModal && <MapView
                ref={mapRef}
                style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}
                showsUserLocation
                followsUserLocation
                mapType="satellite"
                initialRegion={userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude, latitudeDelta: 0.001, longitudeDelta: 0.001 } : undefined}
                onPress={handlePress}
                onRegionChangeComplete={handleMapMovement}
            >
                <Polygon 
                    coordinates={boundaries}
                    fillColor="rgba(219, 255, 232, 0.3)"
                    strokeWidth={3}
                />

                {markers.map((marker, index) => (
                    <Marker
                        draggable
                        key={marker.title}
                        title={marker.title}
                        onDrag={handleMarkerDrag}
                        coordinate={marker.location}
                    >
                        {visibleCallout && <Text style={{ color: 'white' }}>{marker.title}</Text>}
                        <Icon source='map-marker' size={35} color={marker.isNew ? "blue" : "red"}></Icon>
                    </Marker>
                ))}
            </MapView>}
            {showTarget && <View
                style={{
                    flex: 1,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginLeft: -25, // Half of icon width
                    marginTop: -25, // Half of icon height
                    zIndex: 1
                }}
            >
                <Icon source='target' size={50} color="white" />
            </View>}
            {treeModal && <TreeForm 
                changeMode="add"
                tree={null}
                onCancel={() => setTreeModal(false)}
                onSubmit={treeSave}
                defaultPlot={selectedPlot}
                defaultLocation={centerCords ? centerCords: undefined}
            />}
            {!treeModal && <FAB 
                icon={visibleCallout ? "label-outline" : "label-off-outline"}
                style={{
                    position: 'absolute',
                    backgroundColor: '#90EE90',
                    margin: 16,
                    right: 0,
                    bottom: 0,
                  }}
                onPress={toggleCallout}
            />}
            {!treeModal && <FAB 
                icon={showTarget ? 'palm-tree' : 'plus'}
                style={{
                    position: 'absolute',
                    backgroundColor: '#90EE90',
                    margin: 16,
                    right: 0,
                    bottom: 70,
                }}
                onPress={handleAddTreeMarker}
            />}
        </View>
    );
}

export default MapScreen;