import { View, Text, Modal, ScrollView } from 'react-native';
import React, {  useContext } from 'react';
import { Strings } from '../services/Strings';
import GlobalContext from '../context/GlobalContext ';
import {  Iconstyles, customModalStyles, shiftStyles } from '../services/Styles';
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
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ ...customModalStyles.plotSelectScrollView }}>
                <View style={customModalStyles.plotSelectOuterView}>
                    <View style={{ ...customModalStyles.plotSelectView }}>
                        <View>
                            <Text style={customModalStyles.textView(lightTheme)}>Choose Shift Type</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <View style={{ ...shiftStyles.buttonContainerInner, width: '85%' }}>
                                <Button
                                    icon={() => (
                                        <View style={Iconstyles.buttonPosition}>
                                            <StackedIcons
                                                names={['plus', 'tree']}
                                                styles={[{ opacity: 0.9, position: 'absolute' }, { opacity: 0.5, position: 'absolute' }]}
                                            />
                                        </View>
                                    )}
                                    mode="contained"
                                    buttonColor='#059636'
                                    onPress={() => {
                                        setShiftModalVisible(false)
                                        onShiftModalClose()
                                        setShiftType(shiftTypes.addSapling)

                                    }}
                                    contentStyle={Iconstyles.buttonContent}
                                    labelStyle={Iconstyles.buttonLabel}
                                >
                                    {Strings.buttonLabels.UploadTree}

                                </Button>
                            </View>

                            <View style={{ ...shiftStyles.buttonContainerInner, width: '85%' }}>
                                <Button
                                    icon={() => (
                                        <View style={Iconstyles.buttonPosition}>
                                            <StackedIcons
                                                names={['plus', 'camera']}
                                                styles={[{ opacity: 0.9, position: 'absolute' }, { opacity: 0.5, position: 'absolute' }]}
                                            />
                                        </View>
                                    )}
                                    mode="contained"
                                    buttonColor='#059636'
                                    onPress={() => {
                                        setShiftModalVisible(false)
                                        onShiftModalClose()
                                        setShiftType(shiftTypes.addImage)
                                    }}
                                    contentStyle={Iconstyles.buttonContent}
                                    labelStyle={Iconstyles.buttonLabel}
                                >
                                    {Strings.buttonLabels.AddImage}

                                </Button>
                            </View>

                            <View style={{ ...shiftStyles.buttonContainerInner, width: '85%' }}>
                                <Button
                                    icon={() => (
                                        <View style={Iconstyles.buttonPosition}>
                                            <StackedIcons
                                                names={['plus', 'mountain']}
                                                styles={[{ opacity: 0.9, position: 'absolute' }, { opacity: 0.5, position: 'absolute' }]}
                                            />
                                        </View>
                                    )}
                                    mode="contained"
                                    buttonColor='#059636'
                                    onPress={() => {
                                        setShiftModalVisible(false)
                                        onUpdatePlotModalClose()
                                        setShiftType(shiftTypes.updatePlot)
                                    }}
                                    contentStyle={Iconstyles.buttonContent}
                                    labelStyle={Iconstyles.buttonLabel}
                                >
                                    {Strings.buttonLabels.UpdatePlot}

                                </Button>
                            </View>

                            <View style={{ ...shiftStyles.buttonContainerInner, width: 200 }}>
                                <Button
                                    //icon="close"
                                    mode="contained"
                                    buttonColor='#FF0000'
                                    onPress={() => setShiftModalVisible(false)}
                                    contentStyle={Iconstyles.cancelButtonContent}
                                    labelStyle={Iconstyles.cancelButtonLabel}
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