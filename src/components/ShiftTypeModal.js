import { View, Text, Modal, ScrollView, Image } from 'react-native';
import React, { useContext } from 'react';
import { Strings } from '../services/Strings';
import GlobalContext from '../context/GlobalContext ';
import { Iconstyles, customModalStyles, shiftStyles, commonStyles } from '../services/Styles';
import { Button } from 'react-native-paper';
import { StackedIcons } from './Components';
import { shiftTypes } from '../screens/Shifts';

export const ShiftTypeModal = ({ shiftModalVisible, setShiftModalVisible, onShiftModalClose, onUpdatePlotModalClose }) => {
    const { lightTheme } = useContext(GlobalContext);

    const { setShiftType } = useContext(GlobalContext);

    return (

        <Modal
            animationType="slide"
            transparent={true}
            visible={
                shiftModalVisible
            }
            onRequestClose={() => setShiftModalVisible(false)}
        >
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{
                marginTop: 80,
                backgroundColor: "white",
                margin: 12, shadowColor: "black", shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.5,
                shadowRadius: 4,
                elevation: 5,
                borderColor: lightTheme ? "white" : 'black', borderWidth: 1,

            }}>
                <View style={{
                    height: '100%',
                    //backgroundColor: 'red',
                    //borderRadius: 0,
                    marginHorizontal: 15,
                    alignItems: 'center',
                    // shadowColor: '#000',
                    // shadowOffset: {
                    //     width: 0,
                    //     height: 2,
                    // },
                    // shadowOpacity: 0.25,
                    // shadowRadius: 4,
                    // elevation: 5,
                }}>
                    <View style={{
                        backgroundColor: 'white',
                        paddingHorizontal: 2,
                        margin: 10,
                        borderRadius: 1, width: '98%', shadowOffset: 2
                    }}>
                        <View>
                            <Text style={{
                                fontSize: lightTheme ? 20 : 23,
                                fontFamily: 'Inter-Regular',
                                fontWeight: lightTheme ? '700' : "bold", color: lightTheme ? '#52525C' : 'black',
                                margin: 20, marginBottom: 10
                            }}>{Strings.buttonLabels.EnterShiftType}</Text>
                        </View>
                        <View style={{ alignItems: 'center', }}>
                            <View style={{
                                margin: 5, marginBottom: 3, width: '88%', 
                                //backgroundColor:"red"
                            }}>
                                <Button
                                    icon={() => (
                                        <View >
                                            <Image
                                                source={require('../../assets/icon-sprout.png')}
                                                style={{
                                                    height: 25, width: 25, tintColor: "white"
                                                }}
                                            />
                                            {/* <StackedIcons
                                                names={['plus', 'tree']}
                                                styles={[{ opacity: 0.9, position: 'absolute' }, { opacity: 0.5, position: 'absolute' }]}
                                            /> */}
                                        </View>
                                    )}
                                    mode="contained"
                                    buttonColor='#059636'
                                    onPress={() => {
                                        setShiftModalVisible(false)
                                        onShiftModalClose()
                                        setShiftType(shiftTypes.addSapling)

                                    }}
                                    style={{ borderRadius: 9 }}
                                    contentStyle={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        height: 50,  // Adjust the height as needed
                                        //marginBottom: 2,
                                        gap: 22
                                    }}
                                    labelStyle={Iconstyles.buttonLabel}
                                >
                                    {Strings.buttonLabels.UploadTree}

                                </Button>
                            </View>

                            <View style={{
                                margin: 5, marginBottom: 3, width: '88%', 
                            }}>
                                <Button
                                    icon={() => (
                                        <View >
                                            <Image
                                                source={require('../../assets/icon-bw-camera.png')}
                                                style={{
                                                    height: 25, width: 25, tintColor: "white"
                                                }}
                                            />
                                            {/* <StackedIcons
                                                names={['plus', 'camera']}
                                                styles={[{ opacity: 0.9, position: 'absolute' }, { opacity: 0.5, position: 'absolute' }]}
                                            /> */}
                                        </View>
                                    )}
                                    mode="contained"
                                    buttonColor='#059636'
                                    onPress={() => {
                                        setShiftModalVisible(false)
                                        onShiftModalClose()
                                        setShiftType(shiftTypes.addImage)
                                    }}
                                    style={{ borderRadius: 9 }}
                                    contentStyle={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        height: 50,  // Adjust the height as needed
                                        //marginBottom: 2,
                                        gap: 22
                                    }}
                                    labelStyle={Iconstyles.buttonLabel}
                                >
                                    {Strings.buttonLabels.AddImage}

                                </Button>
                            </View>

                            <View style={{
                                margin: 5, marginBottom: 3, width: '88%', 
                            }}>
                                <Button
                                    icon={() => (
                                        <View >
                                            <Image
                                                source={require('../../assets/icon-land.png')}
                                                style={{
                                                    height: 25, width: 25, tintColor: "white"
                                                }}
                                            />
                                            {/* <StackedIcons
                                                names={['plus', 'mountain']}
                                                styles={[{ opacity: 0.9, position: 'absolute' }, { opacity: 0.5, position: 'absolute' }]}
                                            /> */}
                                        </View>
                                    )}
                                    mode="contained"
                                    buttonColor='#059636'
                                    onPress={() => {
                                        setShiftModalVisible(false)
                                        onUpdatePlotModalClose()
                                        setShiftType(shiftTypes.updatePlot)
                                    }}
                                    style={{ borderRadius: 9 }}
                                    contentStyle={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        height: 50,  // Adjust the height as needed
                                        //marginBottom: 2,
                                        gap: 22
                                    }}
                                    labelStyle={Iconstyles.buttonLabel}
                                >
                                    {Strings.buttonLabels.UpdatePlot}

                                </Button>
                            </View>

                            <View style={{ margin: 5, marginBottom: 10, width: "88%" }}>
                                <Button
                                    //icon="close"
                                    mode="contained"
                                    buttonColor='#333'
                                    onPress={() => setShiftModalVisible(false)}
                                    contentStyle={Iconstyles.cancelButtonContent}
                                    labelStyle={Iconstyles.cancelButtonLabel}
                                    style={{ borderRadius: 9 }}
                                >
                                    {Strings.buttonLabels.cancel}
                                </Button>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </Modal>
    )
}