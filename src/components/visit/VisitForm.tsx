import { useContext, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Strings } from "../../services/Strings";
import { CustomButtonStyles, treeFormStyles } from "../../services/Styles";
import GlobalContext from '../../context/GlobalContext ';
import { Button, TextInput } from 'react-native-paper';
import { Visit, CreateVisitRequest } from '../../model/visits';
import { DatePicker } from '../DatePicker';
import ImagesView from '../ImagesView';
import ImageOptions from '../ImageOptionsModal';
import { Image, ImageSource } from '../../model/common';
import { DaoClient } from '../../services/db/dao';
import Autocomplete from '../AutocompleteModal';

interface VisitFormInputProps {
    visit: Visit | null,
    changeMode: 'add' | 'edit',
    onSubmit: (data: Visit | CreateVisitRequest, images?: Image[]) => void,
    onCancel: () => void,
}

const VisitForm: React.FC<VisitFormInputProps> = ({ visit, changeMode, onCancel, onSubmit }) => {

    const visitTypes = [
        { id: 'corporate', value: 'Corporate' },
        { id: 'family', value: 'Family'}
    ]

    const { lightTheme } = useContext(GlobalContext);
    const [visitName, setName] = useState('');
    const [visitDate, setVisitDate] = useState<Date | null>(null);
    const [siteId, setSiteId] = useState<number | null>(null);
    const [visitType, setVisitType] = useState(visitTypes[0]);
    const [images, setImages] = useState<ImageSource[]>([]);
    const [deletedImages, setDeletedImages] = useState<number[]>([]);

    useEffect(() => {
        if (visit) {
            const date = new Date(visit.visit_date)
            if (!isNaN(date.getTime())) setVisitDate(date);

            setName(visit.visit_name);
            setSiteId(visit.site_id);

            const type = visitTypes.find((item) => item.id === visit.visit_type)
            if (type) setVisitType(type);

            changeMode === 'edit' && setTimeout(async () => {
                if (!visit.id) return;
                const daoClient = await DaoClient.authenticate();
                const visitImages = await  daoClient.visitImages.getVisitImagesByVisitId(visit.id);

                const images = visitImages.map(visitImage => {
                    if (visitImage.image_url) return { uri: visitImage.image_url, id: visitImage.local_id};
                    return { uri: `data:image/jpg;base64,${visitImage.data}`, id: visitImage.local_id};
                })

                setImages(prev => [...prev, ...images])
            }, 10)
        }
    }, [visit])

    const handleSubmit = () => {
        if (!visitDate) {
            return;
        }
        const data = {
            visit_name: visitName,
            visit_date: visitDate.toISOString(),
            site_id: siteId,
            visit_type: visitType.id,
        }

        if (changeMode === 'add') {
            const newVisit = { ...data } as CreateVisitRequest;
            onSubmit(newVisit)
        } else if (visit) {
            let newChanges = { ...visit, ...data } as Visit;
            const newImages: Image[] = [];
            images.forEach(image => {
                if (image.data !== undefined && image.name !== undefined) newImages.push({ name: image.name, data: image.data });
            });
            onSubmit(newChanges, newImages)
        }

        setTimeout(async () => {
            if (deletedImages.length === 0) return;
            const daoClient = await DaoClient.authenticate();
            for (const imageId of deletedImages) {
                await  daoClient.visitImages.deleteVisitImage(imageId);
            }

        }, 10)
    }

    const handleImageChange = (image?: Image) => {
        if (image) {
            setImages(prev => [...prev, {...image, uri: `data:image/jpg;base64,${image.data}`}])
        }
    }

    const handleImageDelete = (index: number) => {
        index = images.length - 1 - index; // since we have passed reversed array to component
        const image = images[index];
        if (image.id !== undefined) {
            const id = image.id
            setDeletedImages(prev => [...prev, id])
        }

        setImages([...images.slice(0, index), ...images.slice(index + 1)])
    }

    return (
        <View style={{ height: "97%", width: '100%', flexGrow: 1 }}>
            <Text style={treeFormStyles.plotSapling}> { changeMode === 'add' ? 'Add Visit' : 'Edit Visit' } </Text>
            <ScrollView
                keyboardShouldPersistTaps='handled'
                scrollEnabled={true}
                style={{ ...treeFormStyles.detailsContainerOuter, marginHorizontal: 10, }} >
                <View style={{ margin: 4, borderRadius: 10 }}>
                <View style={{ marginTop: 15, flexGrow: 1 }}>
                        <TextInput
                            value={visitName}
                            mode='outlined'
                            label={Strings.labels.VisitName}
                            onChangeText={(text) => { setName(text) }}
                            disabled
                        />
                    </View>
                    <View style={{ marginTop: 15, flexGrow: 1 }}>
                        <Autocomplete 
                            value={visitType}
                            options={visitTypes}
                            label={Strings.labels.VisitType}
                            keyGetter={(option) => option.id}
                            valueGetter={(option) => option.value}
                            onSelect={(option) => {option && setVisitType(option)}}
                            variant='outlined'
                            disabled
                        />
                    </View>
                    <View style={{ marginTop: 15, flexGrow: 1 }}>
                        <DatePicker
                            label={Strings.labels.VisitDate}
                            value={visitDate}
                            onChange={setVisitDate}
                            disabled
                        />
                    </View>

                    {changeMode !== 'add' && <View style={{ marginTop: 15, flexGrow: 1 }}>
                        <ImagesView
                            title='Visit Images'
                            images={images.map(item => item).reverse()}
                            onDelete={handleImageDelete}
                        />
                    </View>}
                    {changeMode !== 'add' && <ImageOptions onChange={handleImageChange} multiple />}

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

export default VisitForm;