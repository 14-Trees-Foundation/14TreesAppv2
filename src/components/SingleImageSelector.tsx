import { Image } from "../model/common";
import { TouchableOpacity, View } from "react-native";
import ImageOptions from "./ImageOptionsModal";
import { Card, IconButton } from "react-native-paper";
import { useState } from "react";
import ImageView from "react-native-image-viewing";

interface ImageSelectorInputProps {
    label: string
    buttonLabel: string
    imageUri?: string,
    defaultImageUri?: string,
    onChange: (data: Image | null) => void
    onImageLoad?: () => void
}

export const ImageSelector: React.FC<ImageSelectorInputProps> = ({ label, buttonLabel, imageUri, defaultImageUri, onChange, onImageLoad }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [optionsVisible, setOptionsVisible] = useState(false);
    const handleChange = (data?: Image) => {
        if (data) onChange(data);
        setOptionsVisible(false);
    }

    const handleRemoveImage = () => {
        onChange(null);
    }

    const handleImagePress = () => {
        if (imageUri) {
            setIsVisible(true);
        } else {
            setOptionsVisible(true);
        }
    }

    return (
        <View>
            {(imageUri || defaultImageUri) && <View>
                <Card>
                    <Card.Title
                        title={label}
                        subtitle={(!imageUri && defaultImageUri) ? 'Click below image to take a picture' : undefined}
                        right={imageUri ? (props) => <IconButton icon='close' size={props.size} onPress={handleRemoveImage} /> : undefined}
                    />
                    <TouchableOpacity onPress={handleImagePress} activeOpacity={0.9}>
                        <Card.Cover 
                            onLoad={() => { imageUri && onImageLoad && onImageLoad(); }} 
                            source={{ uri: imageUri || defaultImageUri }} 
                            defaultSource={require('../../assets/placeholder.png')} 
                            resizeMode='contain'
                            style={{ backgroundColor: 'white' }}
                        />
                    </TouchableOpacity>
                </Card>
                <ImageView
                    images={[{ uri: imageUri }]}
                    imageIndex={0}
                    visible={isVisible}
                    onRequestClose={() => setIsVisible(false)}
                />
            </View>}
            {!imageUri && <ImageOptions 
                buttonLabel={buttonLabel} 
                onChange={handleChange} 
                optionsVisible={defaultImageUri ? optionsVisible : undefined} 
                onCancel={defaultImageUri ? () => setOptionsVisible(false) : undefined} 
            />}
        </View>
    );
}