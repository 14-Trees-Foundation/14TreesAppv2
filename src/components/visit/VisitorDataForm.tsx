import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { Strings } from '../../services/Strings';
import { Image } from '../../model/common';
import { ImageSelector } from '../SingleImageSelector';
import UserUpsertForm from '../trees/UpsertUserForm';
import { User } from '../../model/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Constants } from '../../services/Utils';

export type VisitorDataSubmit = {
  sapling_id: string;
  user: User | null;
  visit_id: number | null;
  images: {
    user_tree_image?: Image | null;
    user_card_image?: Image | null;
  };
}

interface VisitorDataFormProps {
  visitId?: number;
  defaultSaplingId?: string;
  onSubmit: (data: VisitorDataSubmit) => void;
  onCancel: () => void;
}

const VisitorDataForm: React.FC<VisitorDataFormProps> = ({ visitId, defaultSaplingId, onSubmit, onCancel }) => {
  const [saplingId, setSaplingId] = useState(defaultSaplingId || '');
  const [user, setUser] = useState<User | null>(null);
  const [userTreeImage, setUserTreeImage] = useState<Image | null>(null);
  const [userCardImage, setUserCardImage] = useState<Image | null>(null);

  const [errors, setErrors] = useState({ saplingId: false });

  useEffect(() => {
    // Prefill user from current user details if available
    const prefillUser = async () => {
      try {
        const raw = await AsyncStorage.getItem(Constants.userDetailsKey);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        // Expecting at least id/local_id + name/email
        if (parsed && (parsed.local_id || parsed.id)) {
          setUser({
            local_id: parsed.local_id ?? 0,
            id: parsed.id ?? null,
            name: parsed.name ?? '',
            email: parsed.email ?? '',
            phone: parsed.phone ?? '',
            dob: parsed.dob ?? null,
          });
        }
      } catch (e) {
        // ignore prefill errors
      }
    };
    prefillUser();
  }, []);

  const handleSubmit = () => {
    console.log("Save visit data called!")
    setErrors({ saplingId: false });
    if (!saplingId) {
      setErrors({ saplingId: true });
      return;
    }
    onSubmit({
      sapling_id: saplingId,
      user,
      visit_id: visitId || null,
      images: {
        user_tree_image: userTreeImage,
        user_card_image: userCardImage,
      },
    });
  };

  return (
    <ScrollView style={{ width: '100%', padding: 10 }}>
      <TextInput
        label={Strings.labels.SaplingId}
        mode="outlined"
        value={saplingId}
        onChangeText={setSaplingId}
        error={errors.saplingId}
      />
      {errors.saplingId && (
        <HelperText type="error" visible={errors.saplingId}>
          {Strings.labels.SaplingId} is required
        </HelperText>
      )}

      {/* User - optional; prefilled when available */}
      <UserUpsertForm value={user} onSelect={setUser} />

      {/* Images - both optional, show preview like TreeForm using default placeholders and imageUri state */}
      <View style={{ marginTop: 10 }}>
        <ImageSelector
          label={Strings.labels.UserTreeImage}
          buttonLabel={Strings.buttonLabels.AddUserTreeImage}
          onChange={(img) => {
            setUserTreeImage(img);
          }}
          imageUri={userTreeImage ? `data:image/jpg;base64,${userTreeImage.data}` : undefined}
          defaultImageUri='https://drive.google.com/uc?id=1mFig4YN4OFxeDi63taZYQVX6T-eaVHWv'
        />
      </View>
      <View style={{ marginTop: 10 }}>
        <ImageSelector
          label={Strings.labels.UserCardImage}
          buttonLabel={Strings.buttonLabels.AddUserCardImage}
          onChange={(img) => {
            setUserCardImage(img);
          }}
          imageUri={userCardImage ? `data:image/jpg;base64,${userCardImage.data}` : undefined}
          defaultImageUri='https://drive.google.com/uc?id=102Pu4dqADhamwDmDI00f4ijiyx1v8ZgA'
        />
      </View>

      <View style={{ flexDirection: 'row', marginTop: 16 }}>
        <Button mode="contained" style={{ flex: 1, marginRight: 8 }} onPress={handleSubmit}>
          {Strings.buttonLabels.save}
        </Button>
        <Button mode="outlined" style={{ flex: 1 }} onPress={onCancel}>
          {Strings.buttonLabels.cancel}
        </Button>
      </View>
    </ScrollView>
  );
};

export default VisitorDataForm;