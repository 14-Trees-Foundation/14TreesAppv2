import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { BackHandler, StyleSheet, ToastAndroid, View } from 'react-native';
import { Divider, Icon, Text } from 'react-native-paper';
import GlobalContext from '../context/GlobalContext ';
import SaplingChipList, { SaplingChipItem } from '../components/plots/SaplingChipList';
import VisitorDataForm, { VisitorDataSubmit } from '../components/visit/VisitorDataForm';
import { DaoClient } from '../services/db/dao';
import { Strings } from '../services/Strings';
import { Visit } from '../model/visits';

interface BulkAddVisitorDataProps {
  navigation: any,
  route: any,
}

const BulkAddVisitorData: FC<BulkAddVisitorDataProps> = ({ navigation, route }) => {
  const saplingIds: string[] = route?.params?.saplings ?? [];
  const visit: Visit | undefined = route?.params?.visit;
  const { langChanged, setPlaySound } = useContext(GlobalContext);
  useEffect(() => {
    console.log('langChanged inside BulkAddVisitorData: ', langChanged);
  }, [langChanged]);

  const [saplings, setSaplings] = useState<SaplingChipItem[]>(saplingIds.map(item => ({ sapling: item, selected: false })));
  const [visitorModal, setVisitorModal] = useState(false);
  const [selectedSapling, setSelectedSapling] = useState<string>('');

  const refreshSaplings = useCallback(async () => {
    const dao = await DaoClient.authenticate();
    const items: SaplingChipItem[] = [];
    for (const s of saplingIds) {
      // Uploaded items
      const uploaded = await dao.treeImages.getTreeImagesForSaplingId(s, true);
      const local = await dao.treeImages.getTreeImagesForSaplingId(s, false);
      const hasUploaded = Boolean(uploaded.user_tree_image || uploaded.user_card_image);
      const hasLocal = Boolean(local.user_tree_image || local.user_card_image);
      items.push({
        sapling: s,
        selected: hasUploaded,
        local: hasLocal,
        badge: Number(hasUploaded) + Number(hasLocal),
      });
    }
    setSaplings(items);
  }, [saplingIds]);

  useEffect(() => {
    refreshSaplings();
  }, [refreshSaplings]);

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  const handleSaplingPress = (saplingId: string) => {
    setSelectedSapling(saplingId);
    setVisitorModal(true);
  };

  const handleVisitorSubmit = async (payload: VisitorDataSubmit) => {
    const dao = await DaoClient.authenticate();
    const { sapling_id, user, images } = payload;

    try {
      // Create tree record if it doesn't exist (same logic as single submission)
      if (visit) {
        // Get first available plant type and plot
        const plantTypes = await dao.plantTypes.getPlantTypes(0, 1);
        const plots = await dao.plots.getPlots(0, 1);

        const treeData = {
          sapling_id,
          plant_type_id: plantTypes.length > 0 ? plantTypes[0].id : 1,
          plot_id: plots.length > 0 ? plots[0].id : 1,
          location: JSON.stringify({ type: 'Point', coordinates: [0, 0] }),
          planted_by: user?.name || 'Unknown',
          tree_status: 'healthy' as const,
          assigned_at: null,
          assigned_to: null,
          assigned_to_local: null,
          visit_id: visit.local_id
        };
        await dao.trees.createTree(treeData);
      }

      const upsert = async (key: 'user_tree_image' | 'user_card_image') => {
        const img = images[key];
        if (!img) return;
        try {
          await dao.treeImages.upsertTreeImage({
            name: img.name,
            data: img.data,
            sapling_id,
            type: key,
            is_active: null,
            user_id: user ? (user.local_id ?? null) : null,
          });
        } catch (err) {
          ToastAndroid.show(`Failed to add ${key.replace('_', ' ')} locally!`, ToastAndroid.SHORT);
        }
      };

      await upsert('user_tree_image');
      await upsert('user_card_image');

      setPlaySound(true);
      ToastAndroid.show('Saved visitor data locally!', ToastAndroid.SHORT);
      setVisitorModal(false);
      refreshSaplings();
    } catch (error) {
      console.error('Error saving visitor data:', error);
      ToastAndroid.show("Failed to save visitor data!", ToastAndroid.SHORT);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text variant='titleMedium' style={{ fontWeight: 'bold' }}>Visitor Data (Bulk)</Text>
      </View>
      <Divider />

      {!visitorModal && (
        <SaplingChipList items={saplings} onSelectionChange={handleSaplingPress} />
      )}
      {visitorModal && (
        <View style={{ flex: 1, alignItems: 'center' }}>
          <VisitorDataForm
            defaultSaplingId={selectedSapling}
            onSubmit={handleVisitorSubmit}
            onCancel={() => setVisitorModal(false)}
          />
        </View>
      )}

      <Divider />
      <View style={styles.footerContainer}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon source='checkbox-blank' size={20} color='#82b398' />
            <Text variant='titleSmall' style={{ marginRight: 10 }}> {Strings.labels.AlreadyExists}</Text>
            <Icon source='checkbox-blank' size={20} color='#ffe7b3' />
            <Text variant='titleSmall'> {Strings.labels.LocalNew}</Text>
            <Icon source='checkbox-blank' size={20} color='#daf7dc' />
            <Text variant='titleSmall'> {Strings.labels.Remaining}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text variant='titleSmall' style={{ fontWeight: 'bold' }}>{Strings.labels.LocalNew}: </Text>
            <Text variant='titleSmall'>{saplings.filter(item => item.local).length}</Text>
            <Text variant='titleSmall' style={{ fontWeight: 'bold', marginLeft: 10 }}>{Strings.labels.Remaining}: </Text>
            <Text variant='titleSmall'>{saplings.length - saplings.filter(item => item.local || item.selected).length}</Text>
            <Text variant='titleSmall' style={{ fontWeight: 'bold', marginLeft: 10 }}>{Strings.labels.Total}: </Text>
            <Text variant='titleSmall'>{saplings.length}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    margin: 10,
    paddingLeft: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  footerContainer: {
    margin: 10,
    paddingLeft: 10,
  },
});

export default BulkAddVisitorData;