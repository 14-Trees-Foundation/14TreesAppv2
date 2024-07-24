import { Image } from "../model/common";
import { View } from "react-native";
import ImageOptions from "./ImageOptionsModal";
import { Card, Icon, IconButton } from "react-native-paper";

interface ImageSelectorInputProps {
    label: string
    imageUri?: string,
    onChange: (data: Image | null) => void
}

export const ImageSelector: React.FC<ImageSelectorInputProps> = ({ label, imageUri, onChange }) => {

    const handleChange = (data?: Image) => {
        if (data) onChange(data);
    }

    const handleRemoveImage = () => {
        onChange(null);
    }

    return (
        <View>
            { imageUri && <Card>
                <Card.Title title={label} right={(props) => <IconButton icon='close' size={props.size} onPress={handleRemoveImage}/>} />
                <Card.Cover source={{ uri: imageUri }} />
            </Card> }
            { !imageUri && <ImageOptions buttonLabel={'Add ' + label} onChange={handleChange}/> }
        </View>
    );
}