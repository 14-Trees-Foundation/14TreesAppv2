import {useCallback, useEffect, useState,} from 'react';
import {
  Alert,
  Button,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  View,
  ToastAndroid,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {Strings} from '../services/Strings';
import {Utils} from '../services/Utils';

import {
  CustomButton,
  ImageWithEditableRemark,
  ImageWithUneditableRemark,
} from './Components';
import {CoordinateSetter} from './CoordinateSetter';
import {CustomDropdown} from './CustomDropdown';
import {commonStyles} from '../services/Styles';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  trees,
  RealmContext,
  plots,
  tree_types,
} from '../models/Tree';
import {BSON} from 'realm';


const {useRealm,useQuery} = RealmContext;
const realm = useRealm();



export const treeFormModes = {
  addTree: 0,
  localEdit: 1,
  remoteEdit: 2,
};

export const TreeForm = ({
  treeData,
  onVerifiedSave,
  mode,
  onCancel,
  onNewImage,
  onDeleteImage,
}) => {
  const {inSaplingId, inLng, inLat, inImages, inTreeType, inPlot, inUserId} =
    treeData;

  //const atlastreesArray = useQuery(trees)
  
  const [saplingid, setSaplingId] = useState(inSaplingId);


  const [lat, setlat] = useState(inLat);
  const [lng, setlng] = useState(inLng);
  // array of images
  const [exisitingImages, setExistingImages] = useState(inImages);
  const [localSaplingIds, setLocalSaplingIds] = useState([]);
  const [liveSaplingIds, setLiveSaplingIds] = useState([]);
  const [images, setImages] = useState([]);
  const [treeItems, setTreeItems] = useState([]);
  const [plotItems, setPlotItems] = useState([]);
  const [mainScrollEnabled, setMainScrollEnabled] = useState(true);
  const [selectedTreeType, setSelectedTreeType] = useState(inTreeType);
  const [selectedPlot, setSelectedPlot] = useState(inPlot);
  const [userId, setUserId] = useState(inUserId);
  const [modalVisible, setModalVisible] = useState(false);
  const [disableButton, setDisableButton] = useState(true);

 

  const treesObjects = realm.objects('trees')
  const atlastrees = treesObjects.map(doc => (doc.sapling_id));

  useEffect(() => {
    console.log(treeData.inSaplingId);
    if (mode === treeFormModes.localEdit) {
      setExistingImages([]);
      setImages(treeData.inImages);
    }

    if (mode === treeFormModes.remoteEdit) {
      //console.log('treeData.image.length-- ', treeData.inImages.length);
      if (treeData.inImages.length === 0) {
        setDisableButton(false);
      } else {
        setDisableButton(true);
      }
    }
  }, [treeData]);

  const handleDeleteExistingItem = async (name, time) => {
    console.log('deleteing images from edit---------');
    const newSetImages = exisitingImages.filter(item => item.name !== name);
    if (newSetImages) {
      console.log(
        'image found delete--------',
        newSetImages.length,
        'time: ',
        time,
      );
    } else {
      console.log(
        'image not found delete---------',
        newSetImages.length,
        'time: ',
        time,
      );
    }

    if (newSetImages.length === 0 && mode === treeFormModes.remoteEdit) {
      setDisableButton(false);
    }

    if (onDeleteImage) {
      await onDeleteImage(name);
    }
    setExistingImages(newSetImages);
  };

  const handleDeleteItem = async name => {
    const newImages = images.filter(item => item.name !== name);
    setImages(newImages);
  };

  //Realm change listener
  function onTreesChanged (trees,changes){
    changes.insertions.forEach((index) => {
      const insertedTree = trees[index];
      console.log(`Welcome our new friend, ${insertedTree.sapling_id}!`);
      console.log("----length of atlasTRees------",treesObjects.length)
    });
  }
  useEffect(()=>{
    try{
    treesObjects.addListener(onTreesChanged)
    return ()=> treesObjects.removeListener(onTreesChanged)
    }catch(error){
      console.error(
        `----------An exception was thrown within the change listener: ${error}`
      );
    }
    return()=> treesObjects.removeListener(onTreesChanged)
  },[])

  

  const onSave = async () => {
    console.log('Sapling id value : ', saplingid);
    if (localSaplingIds.includes(saplingid)) {
      Alert.alert(
        Strings.alertMessages.invalidSaplingId,
        Strings.labels.SaplingId +
          ' ' +
          saplingid +
          ' ' +
          Strings.alertMessages.alreadyExists,
      );
      return;
    } else if (
      liveSaplingIds.includes(saplingid) &&
      mode !== treeFormModes.remoteEdit
    ) {
      Alert.alert(
        Strings.alertMessages.invalidSaplingId,
        Strings.labels.SaplingId +
          ' ' +
          saplingid +
          ' ' +
          Strings.alertMessages.alreadyExistsInDB,
      );
      return;
    } else if (
      saplingid === null ||
      Object.keys(selectedTreeType).length === 0 ||
      Object.keys(selectedPlot).length === 0
    ) {
      Alert.alert(
        Strings.alertMessages.Error,
        Strings.alertMessages.IncompleteFields,
      );
      return;
    } else if (images.length + exisitingImages.length === 0) {
      Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.NoImage);
      return;
    } else {
      try {
        
        //let imageURL = await Utils.imageUpload(images)
         //let imageURL = images[0].data
        let imageURL =  'https://14treesplants.s3.amazonaws.com/trees/678780_2024-04-23T06%3A42%3A53.551Z.jpg';
        //console.log('-----imageURL-----', images[0]);
        try {
          realm.write(() => {
            const locationObj = {
              type: 'Point',
              coordinates: [18.9339189, 73.7764878], //lat,lng
            };
            //realm.create is creating a tree document - model trees
            const treeToUpload = {
              _id: new BSON.ObjectId(), //creating new object id
              sapling_id: saplingid,
              tree_id: BSON.ObjectId(selectedTreeType._id),
              plot_id: BSON.ObjectId(selectedPlot._id),
              user_id: BSON.ObjectId(userId),
              date_added: new Date(),
              image: [imageURL],
              location: locationObj,
            }
            
            console.log('--------------writing to atlas------------');
            console.log('-----imageURL-----', images[0].data);
            realm.create('trees',treeToUpload );
          });
        } catch (error) {
          console.log('-----------error while writing---------', error);
        }



        // //--------------------WITHOUT--REALM--------------------
        const tree = {
          treeid: selectedTreeType.value,
          saplingid: saplingid,
          lat: lat,
          lng: lng,
          plotid: selectedPlot.value,
          user_id: userId,
        };
        //console.log(tree);
        setSaplingId(null);
        setSelectedTreeType({});
        //setSelectedPlot({}); //to default the plot
        setImages([]);
        //await onVerifiedSave(images);
        await onVerifiedSave(tree, images);
      } catch (error) {
        console.error(error);
        const stackTrace = error.stack;
        const errorLog = {
          msg: 'happened while trying to save tree details in onSave() of TreeForm',
          error: JSON.stringify(error),
          stackTrace: stackTrace,
        };
        //console.log("error phone: ", errorLog);
        await Utils.logException(JSON.stringify(errorLog));
      }
    }
  };
 

  const handleAddImage = async image => {
    //console.log("image: ", image);

    if (onNewImage) {
      await onNewImage(image);
    }
    //setImages([...images, image]);

    console.log('handling setting image----');
    setExistingImages([]);
    setImages([image]);
  };

  const pickImage = async selectionId => {
    setModalVisible(false);
    let newImage = await Utils.getImage(true, selectionId);
    if (newImage == undefined) return;
    newImage = await Utils.formatImageForSapling(newImage, saplingid);
    await handleAddImage(newImage);
  };

  const changeImageRemarkTo = (text, name) => {
    const newImages = images.map(image => {
      if (image.name === name) {
        return {
          ...image,
          meta: {
            ...image.meta,
            remark: text,
          },
        };
      }
      return image;
    });
    setImages(newImages);
  };

  const renderImage = ({item, index}) => {
    //console.log('---inside render images---',item);

    const displayString = Utils.getDisplayString(
      index,
      item.meta.capturetimestamp,
      exisitingImages.length + images.length,
    );

    if (index < exisitingImages.length) {
      //existing image, remark uneditable.
      return (
        <ImageWithUneditableRemark
          item={item}
          displayString={displayString}
          key={index}
          onDelete={item => {
            handleDeleteExistingItem(item.name, item.meta.capturetimestamp);
          }}
        />
      );
    }

    //otherwise, remark is editable.

    return (
      <ImageWithEditableRemark
        key={index}
        item={item}
        displayString={displayString}
        onDelete={item => {
          handleDeleteItem(item.name);
        }}
        onChangeRemark={text => {
          changeImageRemarkTo(text, item.name);
        }}
      />
    );
  };

  //Namrata
  const loadDataCallback = useCallback(async () => {
    console.log('-----------fetching data-------------');
    try {
      if (mode === treeFormModes.addTree) {
        let userId = await Utils.getUserId();
        setUserId(userId);
      }
      let {treeTypes, plots} = await Utils.getLocalTreeTypesAndPlots();

      //console.log("----in TReefOrm-----",plots)
      let saplingDocsInLiveDB = await Utils.fetchSaplingIdsFromLiveDB();
      let saplingsInLiveDB = saplingDocsInLiveDB.map(doc => doc.sapling_id);
      //setLiveSaplingIds(saplingsInLiveDB);
      console.log("-------------atlastrees in TReeform------------",atlastrees[0],saplingsInLiveDB[0])
      setLiveSaplingIds(atlastrees)
      //const treesSize = objectSizeOf(saplingsInLiveDB); // Requires the 'object-sizeof' library
      //console.log(`Size of the saplingsInLiveDB trees: ${treesSize} bytes`);

      // //realm
      // setLiveSaplingIds(atlastrees.map(doc => doc.sapling_id));

      setTreeItems(treeTypes);
      setPlotItems(plots);
      let saplingIds = await Utils.fetchSaplingIdsFromLocalDB();
      saplingIds = saplingIds.map(saplingid => saplingid.name);
      saplingIds = saplingIds.filter(id => id !== inSaplingId);
      setLocalSaplingIds(saplingIds);
    } catch (error) {
      console.error(error);
      const stackTrace = error.stack;
      const errorLog = {
        msg: 'happened while trying to fetch tree details from local db(loadDataCallback())',
        error: JSON.stringify(error),
        stackTrace: stackTrace,
      };
      //console.log("error phone: ", errorLog);
      await Utils.logException(JSON.stringify(errorLog));
    }
  }, []);

  useEffect(() => {
    loadDataCallback();
  }, []);

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={{backgroundColor: '#125441', height: '100%'}}
      scrollEnabled={mainScrollEnabled}>
      <View style={{backgroundColor: '#0F4334', margin: 10, borderRadius: 10}}>
        {
          [
            <View>
              <TextInput
                defaultValue={saplingid}
                style={commonStyles.txtInput}
                placeholder={Strings.labels.SaplingId}
                placeholderTextColor={'black'}
                onChangeText={text => {
                  setSaplingId(text);
                }}
                // value={saplingid}
              />
              {liveSaplingIds.includes(saplingid) ? (
                <Text
                  style={{
                    ...commonStyles.text5,
                    color: 'red',
                    fontWeight: 'bold',
                    padding: 5,
                  }}>
                  {saplingid} {Strings.alertMessages.alreadyExistsInDB}
                </Text>
              ) : (
                localSaplingIds.includes(saplingid) && (
                  <Text
                    style={{
                      ...commonStyles.text5,
                      color: 'red',
                      fontWeight: 'bold',
                      padding: 5,
                    }}>
                    {saplingid} {Strings.alertMessages.alreadyExists}
                  </Text>
                )
              )}
            </View>,
            <Text style={{...commonStyles.text4, textAlign: 'center'}}>
              Sapling ID: {saplingid}
            </Text>,
          ][mode]
        }
        <CustomDropdown
          initItem={selectedTreeType}
          items={treeItems}
          label={Strings.labels.SelectTreeType}
          onSelectItem={setSelectedTreeType}
        />
        <CustomDropdown
          initItem={selectedPlot}
          items={plotItems}
          label={Strings.labels.SelectPlot}
          onSelectItem={setSelectedPlot}
        />
        <CoordinateSetter
          setInitLocation={mode === treeFormModes.addTree}
          inLat={inLat ? inLat : 0}
          inLng={inLng ? inLng : 0}
          onSetLat={setlat}
          onSetLng={setlng}
          setOuterScrollEnabled={setMainScrollEnabled}
          plotId={
            selectedPlot ? selectedPlot.value : undefined
          }></CoordinateSetter>

        {/* add the click button functionality for edit tree screen */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 10,
            marginBottom: 15,
            opacity:
              mode === treeFormModes.remoteEdit && disableButton ? 0.8 : 1,
          }}>
          <TouchableOpacity
            style={{
              backgroundColor:
                mode === treeFormModes.remoteEdit && disableButton
                  ? '#969393'
                  : '#1A894E',
              padding: 10,
              borderColor: 'white',
              borderRadius: 5,
              alignItems: 'center',
              borderWidth: 1,
              marginTop: 0,
            }}
            onPress={() => {
              if (mode === treeFormModes.remoteEdit && disableButton) {
                ToastAndroid.show(
                  Strings.alertMessages.deleteImageEdit,
                  ToastAndroid.SHORT,
                );
              } else if (mode === treeFormModes.addTree) {
                pickImage(0); //open camera
              } else {
                setModalVisible(true);
              }
            }}>
            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 17}}>
              {Strings.buttonLabels.ClickPhoto}
            </Text>
          </TouchableOpacity>

          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(false);
            }}>
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}>
              <View style={{backgroundColor: 'white', padding: 40}}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    margin: 10,
                  }}>
                  <TouchableOpacity
                    onPress={() => pickImage(0)}
                    style={{backgroundColor: 'green', padding: 10}}>
                    <Text
                      style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: 15,
                      }}>
                      {' '}
                      {Strings.buttonLabels.openCamera}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => pickImage(1)}
                    style={{backgroundColor: 'green', padding: 10}}>
                    <Text
                      style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: 15,
                      }}>
                      {' '}
                      {Strings.buttonLabels.openGallery}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={{position: 'absolute', top: 10, right: 10, zIndex: 1}}
                  onPress={() => setModalVisible(false)}>
                  <Icon name="close-circle" size={28} color="green" />
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

        <View
          style={{
            margin: 2,
            borderColor: '#5DB075',
            borderRadius: 5,
            flexDirection: 'column',
            backgroundColor: 'white',
          }}>
          <FlatList
            scrollEnabled={false}
            data={[...exisitingImages, ...images]}
            renderItem={renderImage}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginHorizontal: 30,
            marginTop: 25,
            marginBottom: 10,
          }}>
          {onCancel !== undefined && (
            <CustomButton
              text={Strings.buttonLabels.cancel}
              onPress={onCancel}
              opacityStyle={{backgroundColor: 'red'}}
            />
          )}
          <CustomButton text={Strings.buttonLabels.Submit} onPress={onSave} />
        </View>
      </View>
    </ScrollView>
  );
};
