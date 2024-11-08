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
    onChange: (data: Image | null) => void
}

export const ImageSelector: React.FC<ImageSelectorInputProps> = ({ label, buttonLabel, imageUri, onChange }) => {
    const [isVisible, setIsVisible] = useState(false);
    const handleChange = (data?: Image) => {
        if (data) onChange(data);
    }

    const handleRemoveImage = () => {
        onChange(null);
    }

    return (
        <View>
            { imageUri && 
            <View>
                <Card>
                    <Card.Title
                        title={label}
                        right={(props) => <IconButton icon='close' size={props.size} onPress={handleRemoveImage}/>}
                    />
                    <TouchableOpacity onPress={() => setIsVisible(true)} activeOpacity={0.9}>
                        <Card.Cover source={{ uri: imageUri }} defaultSource={require('../../assets/placeholder.png')}/>
                    </TouchableOpacity>
                </Card> 
                <ImageView
                    images={[{ uri: imageUri }]}
                    imageIndex={0}
                    visible={isVisible}
                    onRequestClose={() => setIsVisible(false)}
                />
            </View>
            }
            { !imageUri && <ImageOptions buttonLabel={buttonLabel} onChange={handleChange}/> }
        </View>
    );
}