import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { Strings } from "../../services/Strings";
import { CustomButtonStyles, treeFormStyles } from "../../services/Styles";
import { Button, Checkbox, SegmentedButtons } from 'react-native-paper';
import ImagesView from '../ImagesView';
import ImageOptions from '../ImageOptionsModal';
import { Image, ImageSource } from '../../model/common';
import { DaoClient } from '../../services/db/dao';
import { DatePicker } from '../DatePicker';
import { getHumanReadableDate } from '../../services/Utils';
import { CreateTreeSnapshotRequest } from '../../model/tree_snapshot';

const getImageDescription = (imageDate: string, treeStatus: string) => {
    const treeStatusMap: any = {
        'healthy': 'Healthy',
        'diseased': 'Diseased',
        'dead': 'Dead',
        'lost': 'Lost',
    }
    return `${getHumanReadableDate(imageDate)} (${treeStatusMap[treeStatus]})`
}

interface TreeImageFormInputProps {
    sapling_id: string,
    onSubmit: (images: CreateTreeSnapshotRequest[], deleted: number[], treeStatus: string) => void,
    onCancel: () => void,
}

const TreeImageForm: React.FC<TreeImageFormInputProps> = ({ sapling_id, onCancel, onSubmit }) => {

    const [images, setImages] = useState<(ImageSource | CreateTreeSnapshotRequest)[]>([]);
    const [deletedImages, setDeletedImages] = useState<number[]>([]);
    const [date, setDate] = useState(new Date());
    const [treeStatus, setTreeStatus] = useState('healthy');
    const [dateEnabled, setDateEnabled] = useState(false);

    useEffect(() => {
        if (sapling_id !== '') {
            setTimeout(async () => {
                
                const daoClient = await DaoClient.authenticate();
                const treeSnapshots = await  daoClient.treeSnapshots.getTreeSnapshotsBySaplingId(sapling_id);

                const uris = treeSnapshots.map(treeImage => {
                    const description = getImageDescription(treeImage.created_at, treeImage.tree_status);
                    let imageUri = treeImage.data ? `data:image/jpg;base64,${treeImage.data}`: undefined;
                    if (treeImage.image) imageUri = treeImage.image;

                    return {
                        uri: imageUri, 
                        description: description,
                        id: treeImage.local_id,
                        tree_status: treeImage.tree_status,
                        image_date: treeImage.image_date
                    };
                })

                setImages(prev => [...prev, ...uris])
            }, 10)
        }
    }, [sapling_id])

    const handleSubmit = () => {
        const newImages: CreateTreeSnapshotRequest[] = [];
        images.forEach(image => {
            let imageObj: any = { ...image }
            if (imageObj.id === undefined) {
                newImages.push({ 
                    name: imageObj.name, 
                    data: imageObj.data,
                    tree_status: imageObj.tree_status,
                    image_date: imageObj.image_date,
                });
            }
        });
        if ((treeStatus === 'healthy' || treeStatus === 'diseased') && (newImages.length === 0 && deletedImages.length === 0)) {
            ToastAndroid.show('Images are required for tree audit!', ToastAndroid.LONG);
            return;
        }
        onSubmit(newImages, deletedImages, treeStatus);
    }

    const handleImageChange = (image?: Image) => {
        const imageDate = dateEnabled ? date.toISOString() : new Date().toISOString();
        if (image) {
            const description = getImageDescription(imageDate, treeStatus);
            const uri = `data:image/jpg;base64,${image.data}`
            setImages(prev => [...prev, { ...image, description: description, uri: uri, tree_status: treeStatus, image_date: imageDate }])
        }
    }

    const handleImageDelete = (index: number) => {
        index = images.length - 1 - index; // since we have passed reversed array to component
        const image = images[index];
        if (image) {
            const obj: ImageSource = JSON.parse(JSON.stringify(image))
            if (obj.id) {
                const id = obj.id
                setDeletedImages(prev => [...prev, id])
            }
        }

        setImages([...images.slice(0, index), ...images.slice(index + 1)])
    }

    return (
        <View style={{ height: "97%", width: '100%', flexGrow: 1 }}>
            <Text style={styles.saplingHeaderKey}>{Strings.messages.Sapling + ": "}<Text style={styles.saplingHeaderValue}>{sapling_id}</Text></Text>
            <ScrollView
                keyboardShouldPersistTaps='handled'
                scrollEnabled={true}
                style={{ ...treeFormStyles.detailsContainerOuter, marginHorizontal: 10, }} >
                <View style={{ margin: 4, borderRadius: 10 }}>

                    <View style={{ marginTop: 15, flexGrow: 1 }}>
                        <ImagesView
                            title={images.length > 0 ? Strings.messages.TreeImages : Strings.messages.NoImages}
                            images={ images.map(item => item).reverse() }
                            onDelete={handleImageDelete}
                        />
                    </View>

                    <View style={{ marginTop: 10, flexGrow: 1 }}>
                        <Text style={{ color: 'black', paddingLeft: 10, fontSize: 16, marginBottom: 5 }}>{Strings.messages.WhatIsTreeStatus}</Text>
                        <SegmentedButtons
                            value={treeStatus}
                            onValueChange={setTreeStatus}
                            buttons={[
                                { value: 'healthy', label: 'Healthy', style: { backgroundColor: treeStatus === 'healthy' ? 'lightgreen' : 'white' } },
                                { value: 'diseased', label: 'Diseased', style: { backgroundColor: treeStatus === 'diseased' ? 'lightgreen' : 'white' } },
                                { value: 'dead', label: 'Dead', style: { backgroundColor: treeStatus === 'dead' ? 'lightgreen' : 'white' } },
                                { value: 'lost', label: 'Lost', style: { backgroundColor: treeStatus === 'lost' ? 'lightgreen' : 'white' } },
                            ]}
                        />
                    </View>

                    {/* {(treeStatus === 'healthy' || treeStatus === 'diseased') && <View style={{ marginTop: 10 }}>
                        <Checkbox.Item
                            label={Strings.messages.ImageDate}
                            status={dateEnabled ? "checked" : 'unchecked'}
                            onPress={() => { setDateEnabled(prev => !prev) }}
                            color='#4CAF50'
                        />
                    </View>}
                    {dateEnabled && <View style={{ marginTop: 10, flexGrow: 1 }}>
                        <DatePicker
                            label={Strings.labels.ImageDate}
                            value={date}
                            onChange={setDate}
                        />
                    </View>} */}
                    
                    {(treeStatus !== 'lost') && <ImageOptions buttonLabel={Strings.buttonLabels.AddNewImage} onChange={handleImageChange} multiple/>}

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

const styles = StyleSheet.create({
   saplingHeaderKey: {
    color: '#113160',
    fontFamily: 'Inter-Regular',
    fontSize: 20,
    textAlign: 'left',
    justifyContent: 'center',
    marginTop: 20,
    fontWeight: 'bold',
    padding: 5,
    marginHorizontal: 15
   },
   saplingHeaderValue: {
    color: '#113160',
    fontFamily: 'Inter-Regular',
    fontSize: 20,
    textAlign: 'center',
    justifyContent: 'center',
    marginTop: 25,
    fontWeight: '300',
    padding: 5
   } 
})

export default TreeImageForm;