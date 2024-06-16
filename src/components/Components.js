import { View } from "react-native";
import Fa5Icon from 'react-native-vector-icons/FontAwesome5';

export const StackedIcons = ({ names, styles }) => (
  <View >
    {names.map((name, index) => (
      <Fa5Icon color={'white'} key={index} name={name} size={30} style={[styles.icon, styles[index]]} />
    ))}
  </View>
);