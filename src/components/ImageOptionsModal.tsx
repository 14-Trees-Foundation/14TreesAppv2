import { Modal, TouchableOpacity } from "react-native";
import { View } from "react-native";
import { Utils } from "../services/Utils";
import { Button, Icon } from "react-native-paper";
import { Strings } from "../services/Strings";
import { useEffect, useState } from "react";
import { Image } from "../model/common";

interface ImageOptionsInputProps {
    buttonLabel?: string
    onChange: (image?: Image) => void
    multiple?: boolean
    optionsVisible?: boolean
    onCancel?: () => void
}

const ImageOptions: React.FC<ImageOptionsInputProps> = ({ buttonLabel, onChange, multiple, optionsVisible, onCancel }) => {

    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (optionsVisible) setModalVisible(true);
    }, [optionsVisible])

    const pickImage = async (selectionId: number) => {
        setModalVisible(false);
        Utils.startTask();
        let newImages = await Utils.getImage(true, selectionId, multiple);
        if (newImages && newImages.length ) {
            for (const newImage of newImages) {
                const image = {
                    name: `${newImage?.meta.capturetimestamp}.jpg`,
                    data: newImage.data
                }
                onChange(image);
            }
        }
        Utils.stopTask();
    };

    const handleClose = () => {
        setModalVisible(false);
        onCancel && onCancel();
    }

    return (
        <View>
            {(optionsVisible === undefined) && <Button 
                mode='contained-tonal' 
                icon='file-image-plus-outline' 
                onPress={() => setModalVisible(true)}
                style={{ marginTop: 10 }}
            >{buttonLabel ? buttonLabel : 'Add Images'}</Button>}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleClose}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                    <View style={{ backgroundColor: 'white', padding: 40 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 10 }}>
                            <Button 
                                mode='contained' 
                                icon='camera'
                                onPress={() => pickImage(0)}
                                style={{ borderRadius: 5, backgroundColor: '#4CAF50', marginRight: 10 }}
                                labelStyle={{ fontSize: 20 }}
                            >{Strings.buttonLabels.openCamera}</Button>
                            <Button 
                                mode='contained' 
                                icon='image-multiple-outline' 
                                onPress={() => pickImage(1)}
                                style={{ borderRadius: 5, backgroundColor: '#4CAF50' }}
                                labelStyle={{ fontSize: 20 }}
                            >{Strings.buttonLabels.openGallery}</Button>
                            
                        </View>
                        <TouchableOpacity style={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }} onPress={handleClose}  >
                            <Icon source="close-circle" size={28} color="red" />
                        </TouchableOpacity>
                    </View>

                </View>
            </Modal>
        </View>
    );
}

export default ImageOptions;