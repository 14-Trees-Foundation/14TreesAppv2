import { Text, TouchableOpacity, View } from "react-native";
import { treeFormStyles, treeFormModalStyles } from "../services/Styles";
import { Image } from "react-native";
import { Modal } from "react-native";
import { useState } from "react";
import { Utils } from "../services/Utils";
import Icon from 'react-native-vector-icons/Ionicons';
import { Strings } from "../services/Strings";

interface ImageContainerInputProps {
    image?: {
        name: string,
        data: string
    },
    onChange: (data: any) => void
}

export const ImageContainer: React.FC<ImageContainerInputProps> = ({ image, onChange }) => {

    const [ modalVisible, setModalVisible ] = useState(false);

    const pickImage = async (selectionId: number) => {
        setModalVisible(false);
        Utils.startTask();
        let newImages = await Utils.getImage(true, selectionId);
        if (!newImages || newImages.length === 0) return;
        const image = {
            name: `${newImages[0]?.meta.capturetimestamp}.jpg`,
            data: newImages[0].data
        }
        onChange(image);
        Utils.stopTask();
    };


    return (
        <View>

            <View style={treeFormStyles.imageContainer}>
                <View style={{ width: '100%', height: 200 }}>
                    <TouchableOpacity
                        style={{
                            ...treeFormStyles.imagePicker, backgroundColor: '#969393',
                        }}
                        onPress={() => {
                            setModalVisible(true);
                        }}
                    >

                        {!image?.data ? (
                            <View style={{ ...treeFormModalStyles.cameraIcon, }}>
                                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', margin: 10 }}>
                                    <Image
                                        source={require('../../assets/icon-plus.png')} style={{ width: 30, height: 30, opacity: 0.3 }}
                                    />
                                </View>
                                <View style={{
                                    flex: 1, alignItems: 'center',
                                    marginBottom: 50,
                                    // marginTop: 30 
                                }}>
                                    <Image
                                        source={require('../../assets/icon-bw-camera.png')} style={{ width: 60, height: 60, opacity: 0.3 }}
                                    />
                                </View>
                            </View>
                        )
                            : <Image
                                source={{ uri: `data:image/jpeg;base64,${image.data}` }}
                                style={{...treeFormStyles.imageExists}}
                            />
                        }

                        {image?.data && <TouchableOpacity style={treeFormStyles.imageDelete} onPress={() => {onChange(null)}}>
                            <Image
                                source={require('../../assets/icondelete.png')} // Replace with your delete icon image
                                style={treeFormStyles.deleteIcon} // Adjust the icon dimensions and margin
                            />
                        </TouchableOpacity>}
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: 'white', padding: 40 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 }}>
                            <TouchableOpacity onPress={() => pickImage(0)} style={{
                                backgroundColor: "#059636", padding: 6, borderRadius: 12, width: 120, alignItems: "center", height: 45, shadowColor: 'black',
                                shadowOpacity: 0.8,
                                elevation: 3,
                                shadowRadius: 1,
                                shadowOffset: { width: 1, height: 4 },
                            }}>
                                <Text style={{ color: "white", fontWeight: 'bold', fontSize: 22 }}> {Strings.buttonLabels.openCamera}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => pickImage(1)} style={{
                                backgroundColor: "#059636", padding: 6, borderRadius: 12, width: 120, alignItems: "center", height: 45, shadowColor: 'black',
                                shadowOpacity: 0.8,
                                elevation: 3,
                                shadowRadius: 1,
                                shadowOffset: { width: 1, height: 4 }
                            }}>
                                <Text style={{ color: "white", fontWeight: 'bold', fontSize: 22 }}> {Strings.buttonLabels.openGallery}</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }} onPress={() => setModalVisible(false)}  >
                            <Icon name="close-circle" size={28} color="red" />
                        </TouchableOpacity>
                    </View>

                </View>
            </Modal>
        </View>
    );
}