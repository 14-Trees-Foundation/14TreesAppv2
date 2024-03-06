import { View, BackHandler, FlatList, Text, TouchableOpacity } from "react-native";
import { Strings } from '../services/Strings';
import { MyIconButton } from '../components/Components';
import { useContext, useEffect, useState } from "react";
import { commonStyles } from "../services/Styles";
import LangContext from "../context/LangContext ";

const Shfits = ({ navigation, route }) => {

    const { shifts } = useContext(LangContext);

    useEffect(() => {
        console.log("shifts is done and shifts is: ", shifts);;
    }, [shifts])

    useEffect(() => {
        const backAction = () => {
            navigation.goBack()
            return true; // Prevent default behavior (exit app)
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove(); // Remove event listener on cleanup


    }, [navigation]);

    return (
        <View style={{ marginTop: 20 }}>
            <MyIconButton
                names={['plus', 'tree']}
                styles={[{ opacity: 0.9 }, { opacity: 0.5 }]}
                text={Strings.buttonLabels.StartShift}
                onPress={() =>
                    navigation.navigate(
                        Strings.screenNames.getString('Shift', Strings.english),
                    )
                }
            />

            <View style={{ backgroundColor: '#5DB075', height: '100%', marginTop: 20 }}>
                {shifts === 0 ? (
                    <View style={{ ...commonStyles.borderedDisplay }}>
                        <Text style={{ ...commonStyles.text5 }}>
                            {Strings.messages.NoShiftsFound}
                        </Text>
                    </View>
                ) : (

                    <FlatList
                        style={{ backgroundColor: '#c7d6d0' }}
                        data={Array.from({ length: shifts }, (_, index) => index)}
                        ListHeaderComponent={() => (
                            <View style={{width: '100%', height: 50, alignItems: 'center', padding: 10 }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', backgroundColor: "green" }}>Show all shifts</Text>
                            </View>
                        )}
                        renderItem={({ item }) => (
                            <View style={{ width: '100%', height: 50,alignItems: 'center', padding: 10 }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', backgroundColor: "green" }}>
                                    Shift {item + 1}
                                </Text>
                            </View>
                            // <TouchableOpacity
                            //     style={{ ...commonStyles.shiftButton }}
                            //     onPress={() => handleShiftButtonPress(item)}>
                            //     <Text>Shift {item + 1}</Text>
                            // </TouchableOpacity>
                        )}
                        keyExtractor={item => item.toString()}
                    />
                )}
            </View>

        </View>
    )
}

export default Shfits;