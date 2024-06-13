import { View, Text, Modal, StyleSheet, Dimensions, ScrollView, ToastAndroid, Alert } from 'react-native';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Utils, Constants } from '../services/Utils';
import { Strings } from '../services/Strings';
import GlobalContext from '../context/GlobalContext ';
import { treeFormModes } from './TreeForm';
import { TreeFormModal } from './TreeFormModal';
import LoadingScreen from '../screens/LoadingScreen';
import { CustomButtonStyles, Iconstyles, shiftsStyles, customModalStyles, shiftStyles } from '../services/Styles';
import { CustomDropdown } from './CustomDropdown';
import { stackNavRef } from '../App';
import { Button } from 'react-native-paper';
import { StackedIcons } from './Components';
import PlotSelectModal from './PlotSelectModal';
import { shiftTypes } from '../screens/Shifts';



export const ShiftTypeModal = ({ shiftModalVisible, setShiftModalVisible, onShiftModalClose, onUpdatePlotModalClose }) => {
    const { lightTheme } = useContext(GlobalContext);

    const { setShiftType } = useContext(GlobalContext);

    return (

        <Modal
            animationType="slide"
            transparent={true}
            visible={
                shiftModalVisible //changesNeeded
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
                            <View style={{ ...shiftStyles.buttonContainerInner, width: 350 }}>
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

                            <View style={{ ...shiftStyles.buttonContainerInner, width: 350 }}>
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

                            <View style={{ ...shiftStyles.buttonContainerInner, width: 350 }}>
                                <Button
                                    icon={() => (
                                        <View style={Iconstyles.buttonPosition}>
                                            <StackedIcons
                                                names={['plus', 'home']}
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