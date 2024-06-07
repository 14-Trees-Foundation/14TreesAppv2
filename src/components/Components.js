import { View } from "react-native";
import Fa5Icon from 'react-native-vector-icons/FontAwesome5';

export const StackedIcons = ({ names, styles }) => (
  <View >
    {names.map((name, index) => (
      <Fa5Icon color={'white'} key={index} name={name} size={30} style={[styles.icon, styles[index]]} />
    ))}
  </View>
);






// import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { useState } from 'react';
// import { Strings } from '../services/Strings';
// import { commonStyles } from "../services/Styles";
// import { TouchableOpacity, View, Image, Text, TextInput, Modal, StyleSheet } from "react-native";
// import { Utils } from "../services/Utils";
// import { fontAwesome5List, materialCommunityList } from '../services/IconLists';

// //replace it by react-native UI
// export const CustomButton = ({ text, opacityStyle, textStyle, onPress }) => {
//   let finalOpacityStyle = commonStyles.defaultButtonStyle;
//   if (opacityStyle) {
//     finalOpacityStyle = { ...finalOpacityStyle, ...opacityStyle };
//   }
//   let finalTextStyle = commonStyles.defaultButtonTextStyle;
//   if (textStyle) {
//     finalTextStyle = { ...finalTextStyle, ...textStyle };
//   }
//   const extraStyle = text === Strings.buttonLabels.login ? { backgroundColor: "green", paddingHorizontal: 30, borderRadius: 53, paddingVertical: 10 } : { paddingHorizontal: 30, borderRadius: 53, paddingVertical: 10 };

//   return (
//     <TouchableOpacity onPress={onPress}>
//       <View style={{ ...finalOpacityStyle, ...extraStyle }}>
//         <Text style={{ ...finalTextStyle, fontFamily: 'Inter-Regular', color: 'white', fontSize: 20, fontWeight: "bold" }}>{text}</Text>
//       </View>
//     </TouchableOpacity>
//   );
// }

// //replace it by react-native UI
// export function MyIconStack({ names, sizes, size = 30, color = 'green', styles }) {
//   if (styles && names.length !== styles.length) {
//     throw "Names and styles lengths must match in MyIconStack"
//   }
//   if (sizes && names.length !== sizes.length) {
//     throw "Names and sizes lengths must match in MyIconStack"
//   }

//   return <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative', marginRight: 10, padding: 5, paddingRight: 0 }}>
//     {
//       styles && sizes ?
//         names.map((iconName, index, []) => {
//           return <View key={iconName + Math.random().toString()} style={{ ...styles[index], position: 'absolute' }}>
//             <MyIcon name={iconName} size={sizes[index]} color={color} />
//           </View>
//         })
//         :
//         sizes ?
//           names.map((iconName, index, []) => {
//             return <View key={iconName + Math.random().toString()} style={{ ...styles[index], position: 'absolute' }}>
//               <MyIcon name={iconName} size={sizes[index]} color={color} />
//             </View>
//           })
//           :
//           styles ?
//             names.map((iconName, index, []) => {
//               return <View key={iconName + Math.random().toString()} style={{ ...styles[index], position: 'absolute' }}>
//                 <MyIcon name={iconName} size={size} color={color} />
//               </View>
//             }) :
//             names.map((iconName, index, []) => {
//               return <View key={iconName + Math.random().toString()} style={{ position: 'absolute' }}>
//                 <MyIcon name={iconName} size={size} color={color} />
//               </View>
//             })
//     }
//   </View>
// }
// export function MyIcon({ name, size = 30, color = 'green' }) {
//   if (fontAwesome5List.includes(name)) {
//     return <Fa5Icon name={name} size={size} color={color} />;
//   } else if (materialCommunityList.includes(name)) {
//     return <MCIcon name={name} size={size} color={color} />;
//   }
//   return <Text>??</Text>;
// }

// const findIconComponent = (name) => {
//   if (Fa5Icon.hasIcon(name)) {
//     return Fa5Icon;
//   } else if (MCIcon.hasIcon(name)) {
//     return MCIcon;
//   } else {
//     return null; // or some default icon or component
//   }
// };

// // Custom component to render stacked icons
// export const StackedIcons2 = ({ names, styles }) => (
//   <View >
//     {names.map((name, index) => {
//       const IconComponent = findIconComponent(name);

//       return (
//         IconComponent && (
//           <IconComponent
//             key={index}
//             name={name}
//             size={30}
//             style={[styles.icon, styles[index]]}
//             color={'white'}
//           />
//         )
//       );
//     })}
//   </View>
// );

// export const StackedIcons = ({ names, styles }) => (
//   <View >
//     {names.map((name, index) => (
//       <Fa5Icon color={'white'} key={index} name={name} size={30} style={[styles.icon, styles[index]]} />
//     ))}
//   </View>
// );


//replace it by react-native UI
// export function MyIconButton({
//   name,
//   names,
//   sizes,
//   styles,
//   size = 30,
//   color = '#059636',
//   onPress,
//   iconColor = 'white',
//   text = undefined,
// }) {
//   if (name) {
//     const lngStyle = text === Strings.buttonLabels.SelectLanguage ? { backgroundColor: 'grey', borderColor: "#C2C2C2", borderWidth: 1, fontSize: 10, width: 230, height: 50 } : {}
//     return (
//       <TouchableOpacity
//         style={{ ...styles, ...commonStyles.iconBtn, backgroundColor: color, ...lngStyle }}
//         onPress={onPress}
//       >
//         <MyIcon name={name} size={size} color={iconColor}></MyIcon>
//         {text && (
//           <Text style={{ fontFamily: 'Inter-Regular', fontWeight: '700', color: iconColor, fontSize: size * 0.8 }}> {text}</Text>
//         )}
//       </TouchableOpacity>
//     );
//   } else if (names) {
//     return (
//       <TouchableOpacity
//         style={{
//           ...commonStyles.iconBtn,
//           backgroundColor: color,
//           paddingLeft: 15,
//         }}
//         onPress={onPress}>
//         <MyIconStack
//           names={names}
//           styles={styles}
//           sizes={sizes}
//           size={size}
//           color={iconColor}

//         />
//         {text && (
//           <Text style={{ fontFamily: 'Inter-Regular', fontWeight: '700', color: iconColor, fontSize: size * 0.8 }}> {text}</Text>
//         )}
//       </TouchableOpacity>
//     );
//   } else {
//     return (
//       <TouchableOpacity
//         style={{ ...commonStyles.iconBtn, backgroundColor: color }}
//         onPress={onPress}>
//         <MyIcon name={'??'} size={size} color={iconColor}></MyIcon>
//         {text && (
//           <Text style={{ color: iconColor, fontSize: size * 0.8 }}> {text}</Text>
//         )}
//       </TouchableOpacity>
//     );
//   }
// }

// export const SaveButton = ({
//   onPress,
//   text = Strings.buttonLabels.save,
//   size = 25,
// }) => {
//   return (
//     <MyIconButton
//       name={'check'}
//       onPress={onPress}
//       text={text}
//       size={size}></MyIconButton>
//   );
// };

// export const CancelButton = ({
//   onPress,
//   text = Strings.buttonLabels.cancel,
//   size = 25,
// }) => {
//   return (
//     <MyIconButton
//       name={'cancel'}
//       onPress={onPress}
//       color="red"
//       size={size}
//       text={text}></MyIconButton>
//   );
// };


// export const ImageWithUneditableRemark = ({ item, displayString, onDelete }) => {
//   const [imageModalVisible, setImageModalVisible] = useState(false);

//   const openImageModal = () => {
//     setImageModalVisible(true);
//   };

//   const closeImageModal = () => {
//     setImageModalVisible(false);
//   };

//   return (
//     <View style={{
//       marginHorizontal: 10,
//       marginVertical: 4,
//       borderWidth: 2,
//       borderColor: '#5DB075',
//       borderRadius: 10,
//       flexDirection: 'column',
//     }}>
//       <View style={{ margin: 5, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
//         {/* changes by manjur */}
//         <TouchableOpacity onPress={openImageModal}
//           style={{ alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#5DB075', borderRadius: 5, padding: 5 }}>
//           <Image
//             source={{ uri: `data:image/jpeg;base64,${item.data}` }}
//             style={{ width: 100, height: 100, }} // Set your desired image dimensions and margin
//           />
//         </TouchableOpacity>
//         <Text style={{ ...commonStyles.textX, textAlign: 'center' }}>{displayString}</Text>
//         <TouchableOpacity onPress={() => Utils.confirmAction(() => onDelete(item), Strings.alertMessages.confirmDeleteImage)}>
//           <Image
//             source={require('../../assets/icondelete.png')} // Replace with your delete icon image
//             style={{ width: 20, height: 20, marginLeft: 10 }} // Adjust the icon dimensions and margin
//           />
//         </TouchableOpacity>
//       </View>

//       <Modal
//         visible={imageModalVisible}
//         transparent={true}
//         onRequestClose={false}
//       >
//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
//           <TouchableOpacity onPress={closeImageModal} style={{ position: 'absolute', top: 20, right: 20 }}>
//             <Image
//               source={require('../../assets/icondelete.png')} // Replace with your delete icon image
//               style={{ width: 50, height: 50, marginLeft: 10 }} // Adjust the icon dimensions and margin
//             />
//           </TouchableOpacity>
//           <Image
//             source={{ uri: `data:image/jpeg;base64,${item.data}` }}
//             style={{ width: 350, height: 350 }} // Set your desired larger image dimensions
//           />
//         </View>
//       </Modal>

//       <View style={{}}>
//         <Text style={commonStyles.text4}>
//           Remark: {item.meta.remark}
//         </Text>
//       </View>
//     </View>
//   );
// }

// export const ImageWithEditableRemark = ({ item, displayString, onChangeRemark, onDelete }) => {
//   const [imageModalVisible, setImageModalVisible] = useState(false);


//   const openImageModal = () => {
//     setImageModalVisible(true);
//   };

//   const closeImageModal = () => {
//     setImageModalVisible(false);
//   };

//   return (
//     <View style={{
//       marginHorizontal: 10,
//       marginVertical: 4,
//       borderWidth: 2,
//       borderColor: '#5DB075',
//       borderRadius: 10,
//       flexDirection: 'column',
//     }}>
//       <View style={{ margin: 5, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
//         {/* changes by manjur */}
//         <TouchableOpacity onPress={openImageModal}
//           style={{ alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#5DB075', borderRadius: 5, padding: 5 }}>
//           <Image
//             source={{ uri: `data:image/jpeg;base64,${item.data}` }}
//             style={{ width: 100, height: 100, }} // Set your desired image dimensions and margin
//           />
//         </TouchableOpacity>
//         <Text style={{ ...commonStyles.textX, textAlign: 'center' }}>{displayString}</Text>
//         <TouchableOpacity onPress={() => Utils.confirmAction(() => onDelete(item), Strings.alertMessages.confirmDeleteImage)}>
//           <Image
//             source={require('../../assets/icondelete.png')} // Replace with your delete icon image
//             style={{ width: 20, height: 20, marginLeft: 10 }} // Adjust the icon dimensions and margin
//           />
//         </TouchableOpacity>
//       </View>


//       <Modal
//         visible={imageModalVisible}
//         transparent={true}
//         onRequestClose={false}
//       >
//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
//           <TouchableOpacity onPress={closeImageModal} style={{ position: 'absolute', top: 20, right: 20 }}>
//             <Image
//               source={require('../../assets/icondelete.png')} // Replace with your delete icon image
//               style={{ width: 50, height: 50, marginLeft: 10 }} // Adjust the icon dimensions and margin
//             />
//           </TouchableOpacity>
//           <Image
//             source={{ uri: `data:image/jpeg;base64,${item.data}` }}
//             style={{ width: 345, height: 350 }} // Set your desired larger image dimensions
//           />
//         </View>
//       </Modal>


//       <View>
//         {item.name.startsWith('http') ? (
//           <Text style={commonStyles.text4}>Remark: {item.meta.remark}</Text>
//         ) : (
//           <TextInput
//             style={commonStyles.remark}
//             placeholder={Strings.messages.enterRemark}
//             placeholderTextColor={'#000000'}
//             onChangeText={text => onChangeRemark(text)}
//             value={item.meta.remark}
//           />
//         )}
//       </View>
//     </View>
//   );
// }