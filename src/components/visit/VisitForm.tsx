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
import { Image } from '../../model/common';
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
    const [images, setImages] = useState<Image[]>([]);
    const [imageUris, setImageUris] = useState<string[]>([]);


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

                const uris = visitImages.map(visitImage => {
                    if (visitImage.image_url) return visitImage.image_url;
                    return `data:image/jpg;base64,${visitImage.data}`;
                })

                setImageUris([...imageUris, ...uris])
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
            onSubmit(newChanges, images)
        }
    }

    const handleImageChange = (image?: Image) => {
        if (image) {
            setImages([...images, image])
            setImageUris([...imageUris, `data:image/jpg;base64,${image.data}`])
        }
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
                            images={imageUris}
                        />
                    </View>}
                    {changeMode !== 'add' && <ImageOptions onChange={handleImageChange} />}

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