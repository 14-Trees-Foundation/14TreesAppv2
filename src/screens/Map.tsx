import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { BackHandler, StyleSheet, ToastAndroid, View } from "react-native";
import MapView, { Circle, Marker, Polygon, Region } from "react-native-maps";
import { Icon, Text, TouchableRipple } from "react-native-paper";
import { DaoClient } from "../services/db/dao";
import { TreeForm } from "../components/trees/NewTreeForm";
import { CreateTreeRequest, Tree } from "../model/tree";
import { TreeImageType } from "../model/tree_image";
import { Plot } from "../model/plot";
import GlobalContext from "../context/GlobalContext ";
import ConfirmationModal from "../components/ConfirmationModal";
import SlideUpComponent from "../components/Map/SlideUpComponent";
import { useFocusEffect } from "@react-navigation/native";

// india
const defaultRegion = {
    "latitude": 19.42672623676615,
    "latitudeDelta": 40.02551781377842,
    "longitude": 78.54402227327228,
    "longitudeDelta": 22.864106185734272
}

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

/**
 * Calculates the distance between two coordinates using the Haversine formula.
 * @param coord1 - The first coordinate.
 * @param coord2 - The second coordinate.
 * @returns The distance in meters between the two coordinates.
 */
const haversineDistance = (coord1: Location, coord2: Location): number => {
    const R = 6371e3; // Radius of the Earth in meters
    const lat1 = coord1.latitude * (Math.PI / 180);
    const lat2 = coord2.latitude * (Math.PI / 180);
    const deltaLat = (coord2.latitude - coord1.latitude) * (Math.PI / 180);
    const deltaLon = (coord2.longitude - coord1.longitude) * (Math.PI / 180);

    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

/**
 * Filters a list of coordinates to return only those within a certain radius of a given coordinate.
 * @param coordinates - The list of coordinates to filter.
 * @param center - The coordinate to filter around.
 * @param radius - The radius in meters to filter within.
 * @returns The list of coordinates within the specified radius.
 */
const filterCoordinatesWithinRadius = (
    markers: MarkerType[],
    center: Location,
    radius: number
): MarkerType[] => {
    return markers.filter(marker => haversineDistance(center, marker.location) <= radius);
};

const sortMarkers = (markers: MarkerType[]) => {
    return markers.sort((a, b) => {
        if (a.location.latitude === b.location.latitude) {
            return b.location.longitude - a.location.longitude; // Sort by longitude if latitudes are equal
        }
        return b.location.latitude - a.location.latitude; // Otherwise, sort by latitude
    })
}

const MapScreen: React.FC<MapScreenProps> = ({ navigation, route }) => {
    const mapRef = useRef<MapView>(null);
    const markerRef = useRef<any>(null);
    const plot: Plot = route.params.selectedPlot;
    const saplingId: string = route.params.sapling;
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

    const { setPlaySound } = useContext(GlobalContext);

    const [focusedCoords, setFocusedCoors] = useState<Location | null>(null);
    const [centerCords, setCenterCords] = useState<Location | null>(null);
    const [markers, setMarkers] = useState<MarkerType[]>([]);
    const [regionalMarkers, setReginalMarkers] = useState<MarkerType[]>([]);
    const [visibleCallout, setVisibleCallout] = useState(false);
    const [showTarget, setShowTarget] = useState(false);
    const [treeModal, setTreeModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);
    const [saplingListVisible, setSaplingListVisible] = useState(false);
    const [changeType, setChangeType] = useState<'edit' | 'add'>('add');
    const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
    const [selectedMarker, setSelectedMarker] = useState<MarkerType | null>(null);
    const [treeLocation, setTreeLocation] = useState<Location | null>(null);
    const [regionRadius, setRegionRadius] = useState<number>(-1);

    const resetStates = () => {
        setSelectedTree(null);
        setSelectedMarker(null);
        setShowTarget(false);
    }

    const handleMapMovement = (region: Region) => {
        const center = {
            latitude: region.latitude,
            longitude: region.longitude
        }

        setCenterCords(center)
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
                if (coordinates && coordinates.length === 2) {
                    if (typeof coordinates[0] === 'string') {
                        if (isNaN(parseInt(coordinates[0]))) return;
                        coordinates[0] = parseInt(coordinates[0])
                    }
                    if (typeof coordinates[1] === 'string') {
                        if (isNaN(parseInt(coordinates[1]))) return;
                        coordinates[1] = parseInt(coordinates[1])
                    }
                    markers.push({
                        title: tree.sapling_id,
                        location: { latitude: coordinates[0], longitude: coordinates[1] },
                        isNew: !tree.is_uploaded,
                        tree: tree
                    } as MarkerType)
                }
            }
        })
        setMarkers(markers);
    }

    useEffect(() => {
        getTreeLocations();
    }, [])

    useFocusEffect(useCallback(() => {
        const backAction = () => {
            navigation.goBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []));

    useEffect(() => {
        if (centerCords && regionRadius > 0) {
            const regionalMarkers = filterCoordinatesWithinRadius(markers, centerCords, regionRadius);
            setReginalMarkers(sortMarkers(regionalMarkers));
        } else {
            setReginalMarkers(sortMarkers(markers));
        }
    }, [centerCords, markers, regionRadius])

    useEffect(() => {
        if (mapRef.current && focusedCoords) {
            mapRef.current.animateToRegion({
                latitude: focusedCoords.latitude,
                latitudeDelta: 0.0001,
                longitude: focusedCoords.longitude,
                longitudeDelta: 0.0001
            }, 5000)
        }
    }, [focusedCoords])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (markerRef.current) {
                setFocusedCoors(markerRef.current.props.coordinate)
                markerRef.current.showCallout();
            }
        }, 500)

        return () => clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            let coords: Location[] = []
            if (coordinates.length > 0) {
                coords = coordinates;
            } else {
                coords = markers.map(marker => marker.location)
            }
            if (mapRef.current && coords.length > 0) {
                mapRef.current.fitToCoordinates(coords, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: false,
                });
            }
        }, 500)

        return () => clearTimeout(timeoutId);
    }, []);

    const toggleCallout = () => {
        setVisibleCallout(prev => !prev);
    }

    const handleAddTreeMarker = () => {
        setChangeType('add')

        if (showTarget) {
            setShowTarget(false);
            setTreeModal(true);
        } else {
            setShowTarget(true);
            setSaplingListVisible(false);
        }
    }

    const handleTreeLocationChange = () => {
        if (showTarget && selectedMarker && centerCords) {
            const tree = selectedMarker.tree
            const location = {
                type: 'Point',
                coordinates: [centerCords.latitude, centerCords.longitude]
            }
            tree.location = JSON.stringify(location);

            const updateTree = async () => {
                const daoClient = await DaoClient.authenticate();
                await daoClient.trees.updateTree(tree);

                setSelectedMarker(prev => prev ? { ...prev, isNew: true, location: centerCords } : null)
                getTreeLocations();
                setShowTarget(false);
            }

            updateTree();
        } else {
            setShowTarget(true);
            setSaplingListVisible(false);
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
                        setPlaySound(true);
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
                    await daoClient.trees.updateTree(data);
                    setPlaySound(true);
                    getTreeLocations();
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

            setSelectedTree(null);
        }

        saveTreeData();
    };

    const handleTreeFormClose = () => {
        setTreeModal(false);
    }

    const handleTreeDelete = async () => {
        setDeleteConfirmation(false);
        if (selectedTree) {
            const daoClient = await DaoClient.authenticate();
            await daoClient.trees.deleteTree(selectedTree.local_id);
            setSelectedTree(null);
            setPlaySound(true);
            getTreeLocations();
        }
    }

    const handleTreeEditPress = (saplingId: string) => {
        const idx = markers.findIndex(marker => marker.title === saplingId);
        if (idx >= 0) {
            const marker = markers[idx];
            if (marker.tree.location) {
                const location = JSON.parse(marker.tree.location);
                const coordinates = location.coordinates;
                if (coordinates && coordinates.length === 2) setTreeLocation({ latitude: coordinates[0], longitude: coordinates[1] });
                else setTreeLocation(null);
            }
            setSelectedTree(marker.tree);
            setChangeType('edit');
            setTreeModal(true);
        }
    }

    const handleTreeDeletePress = (saplingId: string) => {
        const idx = markers.findIndex(marker => marker.title === saplingId);
        if (idx >= 0) {
            const marker = markers[idx];
            setSelectedTree(marker.tree);
            setDeleteConfirmation(true);
        }
    }

    const handleTreeSelectPress = (saplingId: string) => {
        const idx = markers.findIndex(marker => marker.title === saplingId);
        if (idx >= 0) {
            const marker = markers[idx];
            setSelectedMarker(marker);
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1, flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
                <MapView
                    ref={mapRef}
                    style={StyleSheet.absoluteFillObject}
                    showsUserLocation
                    followsUserLocation
                    mapType="satellite"
                    initialRegion={defaultRegion}
                    onRegionChangeComplete={handleMapMovement}
                    onPress={(event) => { resetStates(); }}
                >
                    {coordinates.length > 0 && (
                        <Polygon
                            coordinates={coordinates}
                            fillColor="rgba(219, 255, 232, 0.3)"
                            strokeWidth={3}
                        />
                    )}

                    {!selectedMarker && regionalMarkers.map((marker, index) => (
                        <Marker
                            key={marker.title}
                            title={marker.title}
                            coordinate={marker.location}
                            ref={marker.title === saplingId ? markerRef : undefined}
                        >
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                {visibleCallout && <Text style={{ color: 'white' }}>{marker.title}</Text>}
                                <Icon source='map-marker' size={35} color={marker.isNew ? "orange" : "green"} />
                            </View>
                        </Marker>
                    ))}

                    {selectedMarker && (
                        <Marker
                            key={selectedMarker.title}
                            title={selectedMarker.title}
                            coordinate={selectedMarker.location}
                            ref={selectedMarker.title === saplingId ? markerRef : undefined}
                        >
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: 'white' }}>{selectedMarker.title}</Text>
                                <Icon source='map-marker' size={35} color={selectedMarker.isNew ? "orange" : "green"} />
                            </View>
                        </Marker>
                    )}

                    {regionRadius > 0 && centerCords && (
                        <Circle
                            center={centerCords}
                            radius={regionRadius}
                            strokeColor="rgba(177, 243, 250, 1)"
                            fillColor="rgba(177, 243, 250, 0.4)"
                        />
                    )}
                </MapView>
                {saplingListVisible && (
                    <SlideUpComponent
                        items={regionalMarkers.map(marker => marker.title)}
                        visible={saplingListVisible}
                        onTreeEdit={handleTreeEditPress}
                        onTreeDelete={handleTreeDeletePress}
                        onTreeSelect={handleTreeSelectPress}
                        onRadiusChange={setRegionRadius}
                    />
                )}
                {showTarget && (
                    <View style={styles.targetContainer}>
                        <Icon source='target' size={50} color="white" />
                    </View>
                )}
            </View>
            <View style={styles.toolbarContainer}>
                <TouchableRipple style={styles.toolbarButton} onPress={() => { setSaplingListVisible(prev => !prev) }}>
                    <View style={styles.iconContainer}>
                        <Icon source={saplingListVisible ? "tree" : "tree-outline"} size={25} />
                        <Text variant='bodySmall' style={styles.iconText}>Trees</Text>
                    </View>
                </TouchableRipple>
                <TouchableRipple style={styles.toolbarButton} onPress={toggleCallout}>
                    <View style={styles.iconContainer}>
                        <Icon source={visibleCallout ? "label" : "label-off-outline"} size={25} />
                        <Text variant='bodySmall' style={styles.iconText}>Show Tree Ids</Text>
                    </View>
                </TouchableRipple>
                {selectedMarker && (
                    <TouchableRipple style={styles.toolbarButton} onPress={handleTreeLocationChange}>
                        <View style={styles.iconContainer}>
                            <Icon source={showTarget ? 'map-marker-check' : 'map-marker-distance'} size={25} />
                            <Text variant='bodySmall' style={styles.iconText}>Change Location</Text>
                        </View>
                    </TouchableRipple>
                )}
                {!selectedMarker && (
                    <TouchableRipple style={styles.toolbarButton} onPress={handleAddTreeMarker}>
                        <View style={styles.iconContainer}>
                            <Icon source={showTarget ? 'palm-tree' : 'plus'} size={25} />
                            <Text variant='bodySmall' style={styles.iconText}>Add Tree</Text>
                        </View>
                    </TouchableRipple>
                )}
            </View>

            {treeModal && (
                <View style={styles.treeFormContainer}>
                    <TreeForm
                        changeMode={changeType}
                        tree={selectedTree}
                        onCancel={handleTreeFormClose}
                        onSubmit={treeSave}
                        defaultPlot={plot}
                        defaultLocation={
                            changeType === 'add'
                                ? centerCords || undefined
                                : treeLocation || undefined
                        }
                    />
                </View>
            )}

            <ConfirmationModal
                visible={deleteConfirmation}
                text={"Do you want to delete tree with sapling id " + selectedTree?.sapling_id + '?'}
                onCancel={() => setDeleteConfirmation(false)}
                onSubmit={handleTreeDelete}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    toolbarContainer: {
      backgroundColor: 'white',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
      paddingVertical: 10,
    },
    toolbarButton: {
      justifyContent: 'center',
      alignItems: 'center',
      flexGrow: 1,
      marginHorizontal: 5,
    },
    iconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconText: {
      color: 'black',
    },
    targetContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    treeFormContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff', // Semi-transparent background
      zIndex: 10, // Make sure it's above the map
    },
  });

export default MapScreen;