import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, ToastAndroid, View } from "react-native";
import MapView, { Marker, MarkerDragStartEndEvent, Polygon, Region } from "react-native-maps";
import { FAB, Icon, Text } from "react-native-paper";
import { DaoClient } from "../services/db/dao";
import { TreeForm } from "../components/trees/NewTreeForm";
import { CreateTreeRequest, Tree } from "../model/tree";
import { TreeImageType } from "../model/tree_image";
import { Plot } from "../model/plot";

interface Location {
    latitude: number,
    longitude: number
}

interface MarkerType {
    title: string
    location: Location
    isNew: boolean
    tree: Tree
}

interface MapScreenProps {
    navigation: any,
    route: any,
}

const MapScreen: React.FC<MapScreenProps> = ({ navigation, route }) => {
    const mapRef = useRef<MapView>(null);
    const plot: Plot = route.params.selectedPlot;
    const coordinates: Location[] = [];
    if (plot.boundaries) {
        const boundaries = JSON.parse(plot.boundaries);
        if (boundaries.coordinates && boundaries.coordinates.length === 1) {
            boundaries.coordinates[0].forEach((location: any) => {
                coordinates.push({
                    latitude: location[0],
                    longitude: location[1],
                })
            })
        }
    }

    const [capturedCoords, setCapturedCords] = useState<Location | null>(null);
    const [centerCords, setCenterCords] = useState<Location | null>(null);
    const [markers, setMarkers] = useState<MarkerType[]>([]);
    const [visibleCallout, setVisibleCallout] = useState(false);
    const [showTarget, setShowTarget] = useState(false);
    const [treeModal, setTreeModal] = useState(false);
    const [editIcon, setEditIcon] = useState(false);
    const [changeType, setChangeType] = useState<'edit' | 'add'>('add');
    const [selectedTree, setSelectedTree] = useState<Tree | null>(null);

    const handleMarkerDrag = (event: MarkerDragStartEndEvent, tree: Tree) => {
        const coords = event.nativeEvent.coordinate
        const location = {
            type: 'Point',
            coordinates: [ coords.latitude, coords.longitude ]
        }
        tree.location = JSON.stringify(location);

        const updateTree = async () => {
            const daoClient = await DaoClient.authenticate();
            await daoClient.trees.updateTree(tree);
        }

        updateTree();
    }

    const handleMapMovement = (region: Region) => {
        setCenterCords({
            latitude: region.latitude,
            longitude: region.longitude
        })
    }

    const getTreeLocations = async () => {
        if (!plot.id) return;

        const plotId: number = plot.id;
        const daoClient = await DaoClient.authenticate();
        const trees = await daoClient.trees.getTrees(0, 200, undefined, false, plotId);
        const markers: MarkerType[] = []
        trees.forEach(tree => {
            if (tree.location) {
                const coordinates = JSON.parse(tree.location).coordinates;
                markers.push({
                    title: tree.sapling_id,
                    location: { latitude: coordinates[0], longitude: coordinates[1] },
                    isNew: !tree.is_uploaded,
                    tree: tree
                } as MarkerType)
            }
        })
        setMarkers(markers);
    }

    useEffect(() => {
        getTreeLocations();
    }, [])

    useEffect(() => {
        let coords: Location[] = []
        if (coordinates.length > 0) {
            coords = coordinates;
        } else {
            coords = markers.map(marker => marker.location)
        }
        if (mapRef.current && coords.length > 0) {
            mapRef.current.fitToCoordinates(coords, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
            });
        }
      }, [markers]);
    

    useEffect(() => {
        if (treeModal) {
            setCapturedCords(centerCords);
        }
    }, [treeModal, centerCords])

    const toggleCallout = () => {
        setVisibleCallout(prev => !prev);
    }

    const handleAddEditTreeMarker = (isAdd: boolean) => {
        if (isAdd) setChangeType('add')
        else {
            setEditIcon(false);
            setChangeType('edit');
            setTreeModal(true);
            return;
        }

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

            if (changeType === 'add') {
                data = JSON.parse(JSON.stringify(data)) as CreateTreeRequest;
                try {
                    const success = await daoClient.trees.createTree(data)
                    if (success) {
                        ToastAndroid.show("Added Tree Locally!", ToastAndroid.SHORT);
                        getTreeLocations();
                    } else {
                        ToastAndroid.show("Tree with given sapling id already exists!", ToastAndroid.LONG)
                        hasError = true;
                    }
                } catch (err: any) {
                    hasError = true;
                    console.log(err)
                    ToastAndroid.show("Failed to add tree locally!", ToastAndroid.SHORT)
                }
            } else {
                data = JSON.parse(JSON.stringify(data)) as Tree;

                try {
                    await daoClient.trees.updateTree(data)
                    ToastAndroid.show("Updated Tree Locally!", ToastAndroid.SHORT)
                } catch (err: any) {
                    hasError = true;
                    ToastAndroid.show("Failed to update tree locally!", ToastAndroid.SHORT)
                }
            };


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
                region={(treeModal && capturedCoords) ? { ...capturedCoords, latitudeDelta: 0.0001, longitudeDelta: 0.0001 } : undefined}
                onRegionChangeComplete={handleMapMovement}
                onPress={(event) => { setEditIcon(false); setShowTarget(false) }}
            >
                {coordinates.length > 0 && <Polygon
                    coordinates={coordinates}
                    fillColor="rgba(219, 255, 232, 0.3)"
                    strokeWidth={3}
                />}

                {(treeModal && capturedCoords) && <Marker
                    coordinate={capturedCoords}
                >
                    {visibleCallout && <Text style={{ color: 'white' }}>New</Text>}
                    <Icon source='map-marker' size={35} color={"green"}></Icon>
                </Marker>}

                {markers.map((marker, index) => (
                    <Marker
                        draggable
                        key={marker.title}
                        title={marker.title}
                        onDrag={(event) => handleMarkerDrag(event, marker.tree)}
                        coordinate={marker.location}
                        onPress={() => { setSelectedTree(marker.tree); setEditIcon(true) }}
                    >
                        {visibleCallout && <Text style={{ color: 'white' }}>{marker.title}</Text>}
                        <Icon source='map-marker' size={35} color={marker.isNew ? "blue" : "red"} ></Icon>
                    </Marker>
                ))}
            </MapView>}
            {showTarget && <View
                style={{
                    flex: 1,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginLeft: -25, 
                    zIndex: 1
                }}
            >
                <Icon source='target' size={50} color="white" />
            </View>}
            {treeModal &&
                <TreeForm
                    changeMode={changeType}
                    tree={selectedTree}
                    onCancel={() => { setTreeModal(false); }}
                    onSubmit={treeSave}
                    defaultPlot={plot}
                    defaultLocation={(centerCords && changeType === 'add') ? centerCords : undefined}
                />
            }
            {editIcon && <FAB
                icon='circle-edit-outline'
                style={{
                    position: 'absolute',
                    backgroundColor: '#90EE90',
                    margin: 16,
                    right: 0,
                    bottom: 130,
                }}
                onPress={() => handleAddEditTreeMarker(false)}
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
                    bottom: 65,
                }}
                onPress={() => handleAddEditTreeMarker(true)}
            />}
        </View>
    );
}

export default MapScreen;