import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from "react-native";
import { Strings } from '../services/Strings';
import { Utils, Constants } from "../services/Utils";
import { MyIconButton, } from '../components/Components';
import { commonStyles } from "../services/Styles";
import { useEffect, useState, useCallback } from "react";
import { CustomDropdown } from "../components/CustomDropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/FontAwesome';
import Temp from "./temp";
import { ScrollView } from "react-native-gesture-handler";


const Shfit = ({ navigation, route }) => {
    const [plotItems, setPlotItems] = useState([]);
    const [selectedPlot, setSelectedPlot] = useState(null);
    const [userName, setUserName] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [time, setTime] = useState(null);
    const [treesPlanted, setTreesPlated] = useState(0);

    const loadDataCallback = useCallback(async () => {
        console.log('fetching data');
        let { plots } = await Utils.getLocalTreeTypesAndPlots();
        setPlotItems(plots);
    });

    useEffect(() => {
        async function startTask() {
            loadDataCallback();
            console.log("selected plot: ", selectedPlot);
            let userKeyDetails = await AsyncStorage.getItem(Constants.userDetailsKey);
            if (userKeyDetails) {
                userKeyDetails = JSON.parse(userKeyDetails);
                let name = userKeyDetails.name;
                console.log("user name in shift---- ", name);
                if (name) {
                    setUserName(name);
                }
            }

            const currentTime12Hr = Utils.getCurrentTime12Hr();
            setTime(currentTime12Hr);
            console.log("currentTime12Hr: ", currentTime12Hr);
        }

        startTask();

    }, [])

    return (
        <ScrollView >
            <View style={{ backgroundColor: 'white', height: '100%' }}>
                <View style={{ backgroundColor: '#0F4334', margin: 10, borderRadius: 10 }}>
                    <Text style={{ color: 'white', marginLeft: 20, margin: 8, marginTop: 8, fontSize: 18, fontWeight: 'bold', textAlign: "center" }}>{userName}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: "wrap" }}>
                        <Text style={{ color: 'white', marginLeft: 20, margin: 8, marginTop: 5, marginRight: 2, fontSize: 18, fontWeight: 'bold' }}>
                            Start Time : {time ? time : ''}
                        </Text>
                        <View style={{ height: 30, width: 1, backgroundColor: 'white', marginHorizontal: 10, marginVertical: 4 }} />
                        <Text style={{ color: 'white', marginLeft: 0, margin: 8, marginTop: 5, fontSize: 18, fontWeight: 'bold' }}>
                            Trees Planted : {treesPlanted}
                        </Text>
                    </View>
                    <Text style={{ color: 'white', marginLeft: 20, margin: 8, marginTop: 5, fontSize: 18, fontWeight: 'bold', }}>
                        {Strings.messages.EnterPlotName} : {selectedPlot ? selectedPlot.name : ''}
                    </Text>



                    {
                        (!isEditing) && <CustomDropdown
                            initItem={selectedPlot}
                            items={plotItems}
                            label={Strings.labels.SelectPlot}
                            onSelectItem={(item) => {
                                console.log("------item got-----", item);
                                setSelectedPlot(item);
                                setIsEditing(true);
                            }}
                            showClearButton={true}
                        />
                    }


                    {
                        isEditing && <View style={{ marginLeft: 120, marginRight: 120, padding: 0 }}>
                            <MyIconButton
                                names={['edit']}
                                styles={[{ opacity: 0.9 }]}
                                text={"Edit Plot"}
                                onPress={() => {
                                    setIsEditing(false);
                                    setSelectedPlot(null);
                                }}
                            />
                        </View>
                    }


                    <View style={{ margin: 20 }}>
                        <MyIconButton
                            names={['plus', 'tree']}
                            styles={[{ opacity: 0.9 }, { opacity: 0.5 }]}
                            text={Strings.buttonLabels.AddNewTree}
                            onPress={() => {
                                if (selectedPlot == null) {
                                    Alert.alert(Strings.alertMessages.NoPlotSelected, Strings.alertMessages.SelectPlot);
                                    return
                                }
                                navigation.navigate(
                                    Strings.screenNames.getString('AddTree', Strings.english),
                                    {
                                        selectedPlot: selectedPlot
                                    }
                                )
                                navigation.addListener('focus', () => {
                                        setTreesPlated(treesPlanted + 1);
                                       // console.log('Trees planted:', treesPlanted);
                                }
                                )
                            }}
                        />
                    </View>
                </View>

                <View style={{ marginTop: 50 }}>
                    <Temp navigation={navigation} />
                </View>
            </View>
        </ScrollView>
    )
}

export default Shfit;