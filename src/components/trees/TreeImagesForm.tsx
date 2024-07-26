import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Strings } from "../../services/Strings";
import { CustomButtonStyles, treeFormStyles } from "../../services/Styles";
import { Button } from 'react-native-paper';
import ImagesView from '../ImagesView';
import ImageOptions from '../ImageOptionsModal';
import { Image } from '../../model/common';
import { DaoClient } from '../../services/db/dao';

interface TreeImageFormInputProps {
    sapling_id: string,
    onSubmit: (images: Image[]) => void,
    onCancel: () => void,
}

const TreeImageForm: React.FC<TreeImageFormInputProps> = ({ sapling_id, onCancel, onSubmit }) => {

    const [images, setImages] = useState<Image[]>([]);
    const [imageUris, setImageUris] = useState<string[]>([]);

    useEffect(() => {
        if (sapling_id !== '') {
            setTimeout(async () => {
                
                const daoClient = await DaoClient.authenticate();
                const treeSnapshots = await  daoClient.treeSnapshots.getTreeSnapshotsBySaplingId(sapling_id);

                const uris = treeSnapshots.map(treeImage => {
                    if (treeImage.image) return treeImage.image;
                    return `data:image/jpg;base64,${treeImage.data}`;
                })

                setImageUris([...imageUris, ...uris])
            }, 10)
        }
    }, [sapling_id])

    const handleSubmit = () => {
        onSubmit(images);
    }

    const handleImageChange = (image?: Image) => {
        if (image) {
            setImages([...images, image])
            setImageUris([...imageUris, `data:image/jpg;base64,${image.data}`])
        }
    }

    return (
        <View style={{ height: "97%", width: '100%', flexGrow: 1 }}>
            <Text style={treeFormStyles.plotSapling}> { 'Add Tree Images For Sapling ' + sapling_id } </Text>
            <ScrollView
                keyboardShouldPersistTaps='handled'
                scrollEnabled={true}
                style={{ ...treeFormStyles.detailsContainerOuter, marginHorizontal: 10, }} >
                <View style={{ margin: 4, borderRadius: 10 }}>

                    <View style={{ marginTop: 15, flexGrow: 1 }}>
                        <ImagesView
                            title='Tree Images'
                            images={imageUris.reverse()}
                        />
                    </View>
                    <ImageOptions onChange={handleImageChange} />

                    <View style={CustomButtonStyles.container}>
                        <View style={CustomButtonStyles.buttonRow}>
                            <View style={CustomButtonStyles.buttonContainer}>
                                <Button
                                    mode="elevated"
                                    buttonColor='#FF6666'
                                    labelStyle={CustomButtonStyles.buttonLabel}
                                    style={CustomButtonStyles.button}
                                    onPress={onCancel}
                                >
                                    {Strings.buttonLabels.cancel}
                                </Button>
                            </View>
                            <View style={CustomButtonStyles.buttonContainer}>
                                <Button
                                    mode='elevated'
                                    onPress={handleSubmit}
                                    buttonColor='#4CAF50'
                                    labelStyle={CustomButtonStyles.buttonLabel}
                                    style={CustomButtonStyles.button}
                                >
                                    {Strings.buttonLabels.Submit}
                                </Button>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

export default TreeImageForm;