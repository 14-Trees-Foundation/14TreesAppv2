import GetLocation from 'react-native-get-location';

export const Location = async () => {
  try {
    let location = await GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 5000,
    });
    return location;
  } catch (error) {
    const {code} = error;
    return code;
  }
};