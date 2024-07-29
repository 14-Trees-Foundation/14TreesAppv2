import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Strings } from "../../services/Strings";
import { CustomButtonStyles, treeFormStyles } from "../../services/Styles";
import { Button, Checkbox, SegmentedButtons } from 'react-native-paper';
import ImagesView from '../ImagesView';
import ImageOptions from '../ImageOptionsModal';
import { Image } from '../../model/common';
import { DaoClient } from '../../services/db/dao';
import { DatePicker } from '../DatePicker';
import { getHumanReadableDate } from '../../services/Utils';
import { CreateTreeSnapshotRequest } from '../../model/tree_snapshot';

const getImageDescription = (imageDate: string, treeStatus: string) => {
    const treeStatusMap: any = {
        'healthy': 'Healthy',
        'diseased': 'Diseased',
        'dead': 'Dead',
    }
    return `${getHumanReadableDate(imageDate)} (${treeStatusMap[treeStatus]})`
}

interface TreeImageFormInputProps {
    sapling_id: string,
    tree_status: string,
    onSubmit: (images: CreateTreeSnapshotRequest[]) => void,
    onCancel: () => void,
}

const TreeImageForm: React.FC<TreeImageFormInputProps> = ({ sapling_id, tree_status, onCancel, onSubmit }) => {

    const [images, setImages] = useState<CreateTreeSnapshotRequest[]>([]);
    const [imageUris, setImageUris] = useState<{uri: string, description: string}[]>([]);
    const [date, setDate] = useState(new Date());
    const [treeStatus, setTreeStatus] = useState(tree_status);
    const [dateEnabled, setDateEnabled] = useState(false);

    useEffect(() => {
        if (sapling_id !== '') {
            setTimeout(async () => {
                
                const daoClient = await DaoClient.authenticate();
                const treeSnapshots = await  daoClient.treeSnapshots.getTreeSnapshotsBySaplingId(sapling_id);

                const uris = treeSnapshots.map(treeImage => {
                    const description = getImageDescription(treeImage.created_at, treeImage.tree_status);
                    if (treeImage.image) return {uri: treeImage.image, description: description};
                    return {uri: `data:image/jpg;base64,${treeImage.data}`, description: description};
                })

                setImageUris([...imageUris, ...uris])
            }, 10)
        }
    }, [sapling_id])

    const handleSubmit = () => {
        onSubmit(images);
    }

    const handleImageChange = (image?: Image) => {
        const imageDate = dateEnabled ? date.toISOString() : new Date().toISOString();
        if (image) {
            setImages(prev => [...prev, { ...image, image_date: imageDate, tree_status: treeStatus}])

            const description = getImageDescription(imageDate, treeStatus);
            setImageUris(prev => [...prev, {uri: `data:image/jpg;base64,${image.data}`, description: description}])
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
                            images={imageUris.map(item => item).reverse()}
                        />
                    </View>
                    <View style={{ marginTop: 10 }}>
                        <Checkbox.Item
                            label="Image date different than today's date?"
                            status={dateEnabled ? "checked" : 'unchecked'}
                            onPress={() => { setDateEnabled(prev => !prev) }}
                            color='#4CAF50'
                        />
                    </View>
                    {dateEnabled && <View style={{ marginTop: 10, flexGrow: 1 }}>
                        <DatePicker
                            label={Strings.labels.ImageDate}
                            value={date}
                            onChange={setDate}
                        />
                    </View>}
                    <View style={{ marginTop: 10, flexGrow: 1 }}>
                        <SegmentedButtons
                            value={treeStatus}
                            onValueChange={setTreeStatus}
                            buttons={[
                                { value: 'healthy', label: 'Healthy', style: { backgroundColor: treeStatus === 'healthy' ? 'lightgreen' : 'white' } },
                                { value: 'diseased', label: 'Diseased', style: { backgroundColor: treeStatus === 'diseased' ? 'lightgreen' : 'white' } },
                                { value: 'dead', label: 'Dead', style: { backgroundColor: treeStatus === 'dead' ? 'lightgreen' : 'white' } },
                            ]}
                        />
                    </View>
                    <ImageOptions onChange={handleImageChange} multiple/>

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