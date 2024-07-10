import { useCallback, useContext, useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, ToastAndroid, View } from 'react-native';
import { Strings } from "../../services/Strings";
import { Constants, Utils } from "../../services/Utils";
import { CoordinateSetter } from "../CoordinateSetter";
import { CustomDropdown } from "../CustomDropdown";
import { CustomButtonStyles, treeFormStyles } from "../../services/Styles";
import GlobalContext from '../../context/GlobalContext ';
import { Button } from 'react-native-paper';
import { DataService } from '../../services/DataService';
import { ImageContainer } from '../ImageContainer';
import { NewCustomDropdown } from '../NewCustomDropdown';
import { CreateTreeRequest, Tree } from '../../model/tree';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TreeFormInputProps {
    tree: Tree | null,
    changeMode: 'add' | 'edit',
    onSubmit: (data: Tree | CreateTreeRequest) => void,
    onCancel: () => void,
}

export const TreeForm: React.FC<TreeFormInputProps> = ({ tree, changeMode, onCancel, onSubmit }) => {

    const [saplingId, setSaplingId] = useState('');
    const [lat, setlat] = useState(0);
    const [lng, setlng] = useState(0);

    const [image, setImage] = useState<any>(null);

    const [plantTypes, setPlantTypes] = useState<any[]>([]);
    const [plots, setPlots] = useState<any[]>([]);

    const [selectedPlantType, setSelectedPlantType] = useState<any>(null);
    const [selectedPlot, setSelectedPlot] = useState<any>(null);
    const [userDetails, setUserDetails] = useState<any>(null);

    const treeStatusList = [
        { value: 'alive', name: 'Alive' },
        { value: 'dead', name: 'Dead' },
        { value: 'lost', name: 'Lost' },
    ];
    const [treeStatus, setTreeStatus] = useState(treeStatusList[0]);

    const { lightTheme } = useContext(GlobalContext);

    useEffect(() => {
        Utils.addTasks();
    }, []);

    useEffect(() => {
        if (tree) {
            setSaplingId(tree.sapling_id);
            if (tree.location) {
                try {
                    let location = JSON.parse(tree.location)
                    if (location.coordinates && location.coordinates.length === 2) {
                        setlat(location.coordinates[0]);
                        setlng(location.coordinates[1]);
                    }
                } catch(err) {
                    console.log(err);
                }
            }
            setTreeStatus(treeStatusList.find((item) => item.value === tree.tree_status) || treeStatusList[0]);
    
            if (tree.image) {
                fetchImageData(tree.image);
            }
        }
    }, [tree])

    const fetchImageData = async (imageUrl: string) => {
        const data = await DataService.fileURLToBase64(imageUrl);
        setImage({ name: imageUrl, data: data });
    }

    useEffect(() => {
        if (tree) {
            const plantType = plantTypes.find((item) => item.id === tree.plant_type_id) || null;
            setSelectedPlantType(plantType)
        }
    }, [tree, plantTypes])

    useEffect(() => {
        if (tree) {
            const plot = plots.find((item) => item.id === tree.plot_id) || null;
            setSelectedPlot(plot)
        }
    }, [tree, plots])

    useEffect(() => {
        setTimeout(async () => {
            try {
                const userData = await AsyncStorage.getItem(Constants.userDetailsKey)
                if (userData) setUserDetails(JSON.parse(userData));
                let { treeTypes, plots } = await Utils.getLocalTreeTypesAndPlots();
                if (treeTypes) setPlantTypes(treeTypes);
                if (plots) setPlots(plots);
            } catch (error: any) {
                console.error(error);
                const stackTrace = error.stack;
                const errorLog = {
                    msg: 'happened while trying to fetch tree details from local db(loadDataCallback())',
                    error: JSON.stringify(error),
                    stackTrace: stackTrace,
                };
    
                await Utils.logException(JSON.stringify(errorLog));
            }
        }, 1000);
    }, []);

    const handleSubmit = () => {
        if (!selectedPlantType || !selectedPlot) {
            ToastAndroid.show("Please Select Plant type and plot", ToastAndroid.SHORT)
            return;
        }

        let location = {
            type: 'Point',
            coordinates: [lat, lng]
        }
        const data = {
            sapling_id: saplingId,
            plant_type_id: selectedPlantType.id,
            plot_id: selectedPlot.id,
            planted_by: userDetails?.name,
            tree_status: treeStatus.value
        }

        if (changeMode === 'add') onSubmit({ ...data, location: JSON.stringify(location)  } as CreateTreeRequest)
        else if (tree) {
            let newChanges = { ...tree, ...data, location: JSON.stringify(location) }
            onSubmit(newChanges as Tree)
        } 

        onCancel()
    }

    return (
        <View style={{ marginBottom: 20, height: "90%" }}>
            <Text style={treeFormStyles.plotSapling}> { changeMode === 'add' ? 'Add Tree' : 'Edit Sapling: ' + saplingId } </Text>
            <ScrollView
                keyboardShouldPersistTaps='handled'
                scrollEnabled={true}
                style={{ ...treeFormStyles.detailsContainerOuter, marginBottom: 10, marginHorizontal: 0, }} >
                <View style={{ margin: 4, borderRadius: 10 }}>

                    <View style={{ marginTop: 15 }}>
                        <Text style={ treeFormStyles.inputLabel }>Sapling Id:</Text>
                        <TextInput
                            defaultValue={saplingId}
                            style={treeFormStyles.textInput(lightTheme, saplingId)}
                            placeholder={Strings.labels.SaplingId}
                            placeholderTextColor={'black'}
                            onChangeText={(text) => { setSaplingId(text) }}
                        />
                    </View>

                    <View>
                        <Text style={ treeFormStyles.inputLabel }>Plant Type:</Text>
                        <CustomDropdown
                            initItem={selectedPlantType}
                            items={plantTypes}
                            label={Strings.labels.SelectTreeType}
                            onSelectItem={setSelectedPlantType}
                        />
                    </View>
                    <View>
                        <Text style={ treeFormStyles.inputLabel }>Plot:</Text>
                        <CustomDropdown
                            initItem={selectedPlot}
                            items={plots}
                            label={Strings.labels.SelectPlot}
                            onSelectItem={setSelectedPlot}

                        />
                    </View>
                    <View>
                        <Text style={ treeFormStyles.inputLabel }>Tree Status:</Text>
                        <CustomDropdown
                            initItem={treeStatus}
                            items={treeStatusList}
                            label={Strings.labels.SelectTreeStatus}
                            onSelectItem={setTreeStatus}
                        />
                    </View>

                    <View style={{ width: '100%', marginTop: 0 }}>
                        <Text style={ treeFormStyles.inputLabel }>{Strings.messages.Location}:</Text>
                        <CoordinateSetter
                            inLat={lat}
                            inLng={lng}
                            onSetLat={(item: number) => setlat(item)}
                            onSetLng={(item: number) => setlng(item)}
                        />
                    </View>

                    <View>
                        <Text style={ treeFormStyles.inputLabel }>Tree Image:</Text>
                        <ImageContainer image={image} />
                    </View>

                    <View>
                        <Text style={ treeFormStyles.inputLabel }>User with Card:</Text>
                        <ImageContainer image={image}/>
                    </View>

                    <View>
                        <Text style={ treeFormStyles.inputLabel }>Assigned To:</Text>
                        <NewCustomDropdown
                            value={treeStatus}
                            options={treeStatusList}
                            label={Strings.labels.SelectTreeStatus}
                            onChange={(data) => { data && setTreeStatus(data); }}
                            valueGetter={(data) => data.value}
                            keyGetter={(data) => data.name}
                        />
                    </View>

                    <View>
                        <Text style={ treeFormStyles.inputLabel }>User Tree Image:</Text>
                        <ImageContainer image={image}/>
                    </View>


                    <View style={CustomButtonStyles.container}>
                        <View style={CustomButtonStyles.buttonRow}>
                            <View style={CustomButtonStyles.buttonContainer}>
                                {
                                    <Button
                                        mode="contained"
                                        buttonColor='red'
                                        labelStyle={CustomButtonStyles.buttonLabel}
                                        style={CustomButtonStyles.button}
                                        onPress={onCancel}
                                    >
                                        {Strings.buttonLabels.cancel}
                                    </Button>
                                }
                            </View>
                            <View style={CustomButtonStyles.buttonContainer}>
                                <Button
                                    onPress={handleSubmit}
                                    buttonColor='#1D4ED8'
                                    labelStyle={CustomButtonStyles.buttonLabel}
                                    style={CustomButtonStyles.button}
                                >
                                    {Strings.buttonLabels.Submit}
                                </Button>
                            </View>
                        </View>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
}

