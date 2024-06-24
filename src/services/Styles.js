import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  pop: {
    backgroundColor: '#5DB075',
    marginLeft: 20,
    marginRight: 20,
    marginTop: 30,
    elevation: 10,
    borderRadius: 10,
  },
  selLang: {
    width: '50%',
    height: 50,
    borderWidth: 0.5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    alignSelf: 'center',
    backgroundColor: '#D3D3D3',
    borderColor: '#A9A9A9',
  },
  label: {
    width: 70,
    //borderWidth: 2,
    //borderColor: 'black',
    borderRadius: 5,
    fontSize: 18,
    alignContent: 'center',
    color: 'white',
    textAlign: 'center',
    textAlignVertical: 'center',
    padding: 5,
    margin: 5,
  },
  success: {
    backgroundColor: 'green',
  },
  danger: {
    backgroundColor: 'red',
  },
  iconBtn: {
    padding: 8,
    margin: 5,
    borderRadius: 15,
    flexDirection: 'row',
    backgroundColor: '#059636',
    justifyContent: 'center',
    alignItems: 'center',
  },
  borderText: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  borderedDisplay: {
    //borderColor: '#F2E47D', borderWidth: 3, borderRadius: 5, margin: 3, padding: 3
    borderColor: '#ccc',
    borderWidth: 2,
    borderRadius: 15,
    margin: 5,
    padding: 3,
    marginTop: 10
  },
  borderedDisplay2: {
    //borderColor: '#F2E47D', borderWidth: 3, borderRadius: 5, margin: 3, padding: 3
    borderColor: '#ccc',
    borderWidth: 0,
    borderRadius: 15,
    margin: 5,
    padding: 3,
    marginTop: 10
  },
  defaultButtonStyle: {
    fontFamily: 'Inter-Regular',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    fontSize: 40,
    borderColor: 'white',
    borderWidth: 1,
    backgroundColor: "#1D4ED8",
    margin: 5,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#1A894E',
    elevation: 4,
    shadowOffset: {
      width: 50,
      height: 50,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    marginTop: 0
  },

  dropdownOptions: {
    fontFamily: 'Inter-Regular',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    fontSize: 45,
    borderColor: 'white',
    borderWidth: 2,
    backgroundColor: '#059636',
    //margin: 5,
    padding: 10,
    borderRadius: 5,
    shadowColor: 'black',
    elevation: 3,
    shadowOffset: {
      width: 50,
      height: 50,
    },
    shadowOpacity: 1,
  },
  dropdownOptionsContent: {
    fontFamily: 'Inter-Regular',
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
  },
  defaultButtonTextStyle: {
    fontFamily: 'Inter-Regular',
    color: 'white',
    textAlign: 'center',
  },
  drawerHeaderLight: {
    backgroundColor: '#F1FAEE',
  },
  drawerHeaderDark: {
    backgroundColor: '#FFD700'
  },
  headerTitleStyleDark: {
    fontFamily: 'Inter-Regular',
    color: '#000',
    fontWeight: '700'
  },
  headerTitleStyleLight: {
    fontFamily: 'Inter-Regular',
    color: '#113160',
    fontWeight: '700'
  },

  logOutButton: {
    backgroundColor: 'red',
    color: 'red',
    padding: 12,
    borderRadius: 53,
    alignItems: 'center',
    marginTop: 13
  },
  searchButton: {
    backgroundColor: "#1D4ED8",
    padding: 3,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 13,
    alignItems: 'center',
    height: 40,
  },
  continueButton: {
    backgroundColor: "#059636",
    padding: 5,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 13,
    alignItems: 'center',
    height: 40,
  },
  remark: {
    height: 70,
    borderWidth: 0.5,
    borderColor: 'grey',
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    margin: 5,
    padding: 5,
    color: 'black', // Change font color here
    fontSize: 16,
  },
  btnview: {
    justifyContent: 'center',
    elevation: 3,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  btn: {
    paddingHorizontal: 20,
    borderRadius: 9,
    backgroundColor: '#1f3625',
    alignItems: 'center',
    paddingVertical: 12,
    height: 50,
  },
  btndisabled: {
    paddingHorizontal: 20,
    borderRadius: 9,
    backgroundColor: '#686868',
    alignItems: 'center',
    paddingVertical: 12,
    height: 50,
  },
  text: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: 'black',
    textAlign: 'left',
    fontWeight: 'bold'
  },
  text2: {
    fontSize: 25,
    color: 'white',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginVertical: 5,
    marginBottom: 40,
  },
  recordTxt: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#1f3625',
    marginTop: 5,
    marginBottom: 5,
    textAlign: 'center',
  },
  btntxt: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    textAlign: 'center',
  },
  text4: {
    fontSize: 17,
    fontFamily: 'Inter-Regular',
    color: 'black',
    textAlign: 'left',
    padding: 5,
  },
  textSync: {
    fontSize: 20,
    fontFamily: 'Inter-Regular',
    color: 'black',
    fontWeight: '700'
  },
  text5: {
    fontSize: 20,
    fontFamily: 'Inter-Regular',
    alignContent: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    color: '#52525C',
  },
  textX: {
    fontSize: 17,
    fontFamily: 'Inter-Regular',
    color: 'black',
    textAlign: 'left',
    margin: 2,
  },
  text3: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'white',
    textAlign: 'left',
    margin: 2,
  },
  text6: {
    fontSize: 17,
    fontFamily: 'Inter-Regular',
    color: 'black',
    textAlign: 'left',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  txtInput: {
    height: 50,
    fontFamily: 'Inter-Regular',
    width: '93%',
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: 'white',
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    color: '#52525C', // Change font color here
    fontSize: 18,
    //fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  headerText: {
    fontSize: 30,
    fontFamily: 'Inter-Regular',
    color: 'white',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 30,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  shiftButton: {
    backgroundColor: "green",
    color: "white",
    fontFamily: 'Inter-Regular',
  },

  secondView: {
    flex: 1,
    flexDirection: 'row',
    fontFamily: 'Inter-Regular',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    //width: '50%',
    borderRadius: 80,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    fontWeight: '700'
  }
});

export const Iconstyles = StyleSheet.create({
  buttonLanguage: {
    height: 55,  // Adjust the height as needed
    marginBottom: 2,
    gap: 42,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,  // Adjust the height as needed
    //marginBottom: 2,
    gap: 42
  },
  buttonLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 24,
    marginLeft: 8,  // Adjust the spacing between the icon and text as needed
    fontWeight: '800',
    paddingTop: 12
  },
  buttonPosition: {
    paddingBottom: 28,
    marginRight: 10
  },
  buttonContent2: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,  // Adjust the height as needed
    //marginBottom: 22,
    gap: 15
  },
  cancelButtonContent: {
    height: 40,
  },
  cancelButtonLabel: {
    fontSize: 19,
  },
});

export const CustomButtonStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: 22,
    marginTop: 15,
    marginBottom: 10,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  buttonLabel: {
    fontFamily: 'Inter-Regular',
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    paddingTop: 5,
  },
  button: {
    height: 50,
    justifyContent: 'center',
    borderRadius: 10,
    borderColor: 'white',
    //borderColor: 'white',
    //borderWidth: 1,
    shadowColor: '#1A894E',
    elevation: 4,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
})

export const coordinateSetterStyles = StyleSheet.create({
  coordinatesView: { marginTop: 15, borderRadius: 12, padding: 8, flexDirection: 'column', backgroundColor: '#e8e9ea' },
  coordinatesText: (lightTheme) => ({
    ...commonStyles.text3, color: lightTheme ? '#52525C' : 'black',
    fontFamily: 'Inter-Regular',
    marginTop: 0
  }),
  innerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }
})

export const customDropdownStyles = StyleSheet.create({
  textInput: (lightTheme, initItem) => ({
    fontSize: 15,
    borderRadius: 13,
    color: lightTheme ? '#52525C' : 'black',
    fontWeight: initItem ? 'bold' : 'normal',
  }),
  clearButton: {
    position: 'absolute',
    top: 22,
    right: 29,
    zIndex: 1,
  },
});

export const customModalStyles = StyleSheet.create({
  plotSelectScrollView: {
    marginTop: 80,
    backgroundColor: 'rgba(0,0,0,.5)',
    margin: 2
  },
  plotSelectView: {
    backgroundColor: 'white',
    padding: 2,
    margin: 10,
    borderRadius: 10, borderColor: '#ccc', borderWidth: 3,
    width: '98%'
  },
  centeredView: {
    marginTop: 200,
    //backgroundColor: 'rgba(0,0,0,1)',
    // width: '100%',
    // height: '100%'
  },
  loadingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 200,
    backgroundColor: 'rgba(0,0,0,.2)',
  },
  textView: (lightTheme) => ({
    ...commonStyles.textSync, color: lightTheme ? '#52525C' : 'black',
    margin: 20, fontSize: 20, marginBottom: 10

  }),
  modalView: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 0,
    //padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  plotSelectOuterView: {

    height: '100%',
    backgroundColor: 'white',
    //borderRadius: 0,
    //padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export const drawerNavigatorStyles = StyleSheet.create({
  navigatorView: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 50,
    bottom: 0,
  },
  image: { width: '50%', height: 150, marginLeft: 10, marginBottom: 2 },
  userDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    margin: 10,
    justifyContent: 'space-around',
  },
  userName: {
    fontFamily: 'Inter-Regular',
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
  },
  userImage: { width: 75, height: 75, borderRadius: 37.5 },
  userType: { fontFamily: 'Inter-Regular', fontSize: 16, color: 'green' },
  logOutButton: {
    flexDirection: 'column',
    position: 'relative',
    marginTop: 15,
    alignSelf: 'center',
  },
});

export const languageModalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //marginTop: 192,
    backgroundColor: 'rgba(0,0,0,.5)',
  },
  modalView: (width) => ({
    margin: 20,
    width: width - 20,
    // height: height / 2,

    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  }),
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  languageItem: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    borderWidth: 0.5,
    marginTop: 10,
    paddingLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
  btns: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  btn2: {
    width: '40%',
    height: 50,
    borderWidth: 0.5,
    borderRadius: 10,
    backgroundColor: '#4B68E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const ScreenHeaderContentStyles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  modeIcon: { width: 35, height: 35, borderRadius: 37.5 }
})

export const shiftHeaderStyles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 10,
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  innerContainer: { margin: 4, borderRadius: 10, marginBottom: 0 },
  plotText: (lightTheme) => ({
    fontFamily: 'Inter-Regular',
    fontWeight: 'bold',
    color: lightTheme ? '#52525C' : 'black',
    margin: 8,
    fontSize: 18,
    marginTop: 1,
  }),
  plotName: (lightTheme) => ({
    fontFamily: 'Inter-Regular',
    fontWeight: 'bold',
    color: lightTheme ? '#52525C' : 'black',
    margin: 8,
    fontSize: 18,
    //opacity: 0.5,
    textAlign: 'center',
    marginTop: 5,
    maxWidth: '100%',
    overflow: 'hidden', // Ensure overflow is hidden
    textDecorationLine: 'underline', // Add underline to make it look like a hyperlink
  }),
  shiftDetailsContainer: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', padding: 4 },
  shiftDetailsView: {
    flexDirection: 'column', flexWrap: 'wrap', width: '50%', marginBottom: 1, marginTop: 0
  },
  shiftTime: (lightTheme) => ({
    fontSize: 18,
    color: lightTheme ? '#52525C' : 'black',
    fontFamily: 'Inter-Regular',
    fontWeight: '700',
    margin: 8,
    marginTop: 0
  }),
  innerView: { flexDirection: 'row', alignItems: 'center', marginLeft: 12, },
  treeDetailsContainer: (showGradient) => ({ ...commonStyles.secondView, backgroundColor: showGradient ? 'lightgreen' : 'white', marginRight: 20, marginLeft: 22, width: '30%', borderWidth: 1, borderColor: "#5CC17B", }),
  iconContainer: { backgroundColor: 'green', borderRadius: 70, padding: 10, margin: 2 },
  treeCount: (lightTheme) => ({
    color: lightTheme ? '#52525C' : 'black',
    fontSize: 18, fontWeight: 'bold', padding: 10, textAlign: 'center'
  })
})

export const treeFormStyles = StyleSheet.create({
  detailsContainerOuter: {
    marginTop: 10,
    //marginHorizontal: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  plotSapling: {
    ...commonStyles.text4,
    color: '#113160',
    fontFamily: 'Inter-Regular',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 25,
    fontWeight: '300',
  },
  textInput: (lightTheme, saplingid) => ({
    ...commonStyles.txtInput,
    color: lightTheme ? '#52525C' : 'black',
    fontSize: 15,
    borderRadius: 13,
    fontWeight: saplingid ? '800' : 'normal',
  }),
  imageContainer: {
    flexDirection: 'column',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'space-around',
    // width: "98%"
  },
  imagePicker: {
    flex: 1,
    padding: 0,
    //backgroundColor: "#e8e9ea",
    borderRadius: 10,
    alignItems: 'center',
    //borderWidth: 1,
    marginTop: 0,
    marginHorizontal: 0,
    margin: 0,
    position: 'relative',
  },
  emptyImage: {
    width: '100%',
    height: 197,
    margin: 0,
    //aspectRatio: 720 / 960, // Aspect ratio of your image (maxWidth / maxHeight)
    //resizeMode: 'contain', // Preserve aspect ratio and fit within the specified dimensions
  },
  imageExists: {
    width: '100%',
    height: 197,
    margin: 1,
    aspectRatio: 1220 / 920, // Aspect ratio of your image (maxWidth / maxHeight)
    //resizeMode: 'contain', // Preserve aspect ratio and fit within the specified dimensions
  },
  imageDelete: { position: 'absolute', top: 8, right: 8 },
  deleteIcon: { width: 25, height: 25, marginLeft: 10 },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10
  },
  modalButtons: { backgroundColor: 'green', padding: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  cancelModal: { position: 'absolute', top: 10, right: 10, zIndex: 1 },
})

export const treeFormModalStyles = StyleSheet.create({
  container: {
    //backgroundColor: 'white',
    padding: 2,
    margin: 10,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 0,
    width: '98%',
    backgroundColor: '#F5F5F5',
    //marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  saplingIdInput: (lightTheme, saplingid) => ({
    color: lightTheme ? '#52525C' : 'black',
    fontSize: 15,
    borderRadius: 13,
    fontWeight: saplingid ? '800' : 'normal',
  }),
  imageContainer: {
    width: '93%',
    height: 200,
    marginHorizontal: 2,
    marginLeft: 15,
  },
  imagePicker: {
    backgroundColor: '#969393',
    padding: 0,
    // borderColor: '#059636',
     borderRadius: 10,
    alignItems: 'center',
    //borderWidth: 1,
    marginTop: 0,
    marginHorizontal: 0,
    margin: 0,
    position: 'relative',
  },
  cameraIcon: {
    width: '100%',
    height: 200,
    margin: 0,
    borderRadius: 10,
    backgroundColor: "#e8e9ea"
  },
  image: {
    width: '100%',
    height: 200,
    margin: 1,
    aspectRatio: 1220 / 920,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 5,
  },
  deleteIcon: {
    width: 25,
    height: 25,
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 30,
    marginTop: 15,
    marginBottom: 5,
  }
});

export const aboutStyles = StyleSheet.create({
  outerView: { backgroundColor: 'white', padding: 40, alignItems: 'center' },
  appName: {
    color: '#0F4334',
    fontSize: 22,
    fontWeight: 'bold',
    paddingBottom: 5,
  },
  text: { color: '#0F4334', fontSize: 18, paddingBottom: 15 }
})

export const editRemoteTreeStyles = StyleSheet.create({
  outerView: { backgroundColor: '#f5f5f5' },
  headingText: (lightTheme) => ({ ...commonStyles.textSync, color: lightTheme ? '#52525C' : 'black', margin: 20, fontSize: 20 }),
  textInput: (lightTheme) => ({ ...commonStyles.txtInput, color: lightTheme ? '#52525C' : 'black', fontSize: 15, borderRadius: 13, width: '85%' }),
  searchButton: { fontFamily: 'Inter-Regular', fontWeight: 'bold', color: 'white', fontSize: 20, marginTop: 3 }
})

export const homeStyles = StyleSheet.create({
  button: lightTheme => ({
    width: 'auto',
    marginBottom: 2,
    marginTop: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 82,
    borderRadius: 50,
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    shadowRadius: 1,
    elevation: 3,

    backgroundColor: lightTheme ? '#e5e7ea' : 'lightgrey',
    borderColor: lightTheme ? '' : 'black',
    borderWidth: lightTheme ? 0 : 1,
    shadowColor: lightTheme ? '#52525c' : 'black', // Shadow color
    shadowOpacity: lightTheme ? 0.3 : 1,
  }),
  buttonText: lightTheme => ({
    fontFamily: 'Inter-Regular',
    fontSize: 20,
    fontWeight: '700',
    color: lightTheme ? '#113160' : 'black',
    textAlign: 'center',
  }),
  imageSpecs: {
    width: 100,
    height: 100,
  },
});

export const loginStyles = StyleSheet.create({
  outerContainer: { backgroundColor: 'white', height: '100%', marginTop: 40 },
  inputContainer: {
    padding: 2,
    margin: 4,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 3,
  },
  textInput: (lightTheme, phoneNumber) => ({
    ...commonStyles.txtInput,
    color: lightTheme ? '#52525C' : 'black',
    fontSize: 15,
    borderRadius: 13,
    fontWeight: phoneNumber ? 'bold' : 'normal',
  }),
  loginView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 30,
    marginTop: 25,
    marginBottom: 10,
  },
});

export const splashScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 200,
    height: 200,
  },
});

export const syncDisplayStyles = StyleSheet.create({
  lastSyncedText: lightTheme => ({
    ...commonStyles.textSync,
    color: lightTheme ? '#52525C' : 'black',
    margin: 20,
  }),
  lastSyncedStatus: lightTheme => ({
    ...commonStyles.borderText,
    marginHorizontal: 20,
    color: lightTheme ? '#52525C' : 'black',
    padding: 5,
    textAlign: 'center',
    fontWeight: '500',
  }),

  syncDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 3,
  },
  syncText: (lightTheme) => ({
    ...commonStyles.textSync,
    color: lightTheme ? '#52525C' : 'black',

  }),
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 5,
    alignItems: 'center',
  },
  progressBarText: (lightTheme) => ({
    ...commonStyles.text5,
    color: lightTheme ? '#52525C' : 'black',
  }),
  buttonWifiContainer: {
    marginHorizontal: 40, marginTop: 25, marginBottom: 10
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,  // Adjust the height as needed
    //marginTop: 2,
    gap: 22
  },
  buttonLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 21,
    marginLeft: 8,  // Adjust the spacing between the icon and text as needed
    fontWeight: 'bold',
    marginTop: 16
  },
});

export const shiftsStyles = StyleSheet.create({
  plotSelectedText: {
    ...commonStyles.text,
    fontSize: 18,
    textAlign: 'center',
  },
  shiftDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    padding: 4,
  },
  shiftDetailsView: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    width: '50%',
    marginBottom: 1,
    marginTop: 0,
    marginLeft: 12,
  },
  text: lightTheme => ({
    ...commonStyles.text,
    fontSize: 14,
    color: lightTheme ? '#52525C' : 'black',
  }),
  icon: {
    marginLeft: 5,
  },
  treesPlanted: {
    flex: 1,
  },
  scrollView: {
    //marginTop: 10,
    backgroundColor: 'white',
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 50,
    marginTop: 24,
    marginBottom: 10
  },
  shiftsView: {
    backgroundColor: 'white',
    height: '100%',
    marginTop: 20,
  },
  flatList: {
    backgroundColor: 'white',
  },
});

export const TreeRowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'white',
    margin: 2,
    borderRadius: 6,
  },
  treeContainer: {
    flex: 1,
    justifyContent: 'space-around',
    width: '25%',
  },
  emptyTreeContainer: {
    justifyContent: 'space-around',
    width: '25%',
  },
  uploadedTreeStyle: {
    backgroundColor: '#059636',
  },
  uploadedTextStyle: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  textStyle: {
    textAlign: 'center',
  },
});

export const ShiftsCardStyles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    // justifyContent: 'center',
    backgroundColor: '#fff',
    opacity: 0.9,
    borderRadius: 6,
    margin: 5,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 15,
  },
  plotSelectedText: (lightTheme) => ({
    ...commonStyles.text,
    color: lightTheme ? '#52525C' : 'black',
    fontSize: 18,
    textAlign: 'left',
    marginLeft: 8,

  }),
  row: {
    flexDirection: 'row',
  },
  syncIconContainer: {
    width: '15%',
    marginLeft: 5,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    padding: 4,
  },
  detailsColumn: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    width: '50%',
    marginLeft: 2,
  },
  detailText: {
    ...commonStyles.text,
    fontSize: 14,
  },
  treeContainer: {
    ...commonStyles.secondView,
    backgroundColor: 'lightgrey',
    marginRight: 2,
    marginLeft: 22,
    width: '30%',
    borderRadius: 33,
    paddingRight: 2
  },
  iconContainer: {
    margin: 6,
    flex: 1,
    marginTop: 12,
    marginLeft: 11,
    marginRight: 12,
  },
  treeIcon: {
    flex: 1,
    backgroundColor: 'green',
    borderRadius: 70,
    padding: 10,
    margin: 2,
  },
  treeCountContainer: {
    flex: 1,
  },
  treeCount: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'right',
    marginRight: "left",
  },
});

export const treesInShiftStyles = StyleSheet.create({
  scrollView: {
    backgroundColor: 'white',
    height: '100%',
  },
  shiftContainerInner: {
    flex: 1,
    flexDirection: 'column',
    paddingVertical: 8,
  },
  treeListContainer: {
    margin: 2,
    borderColor: '#5DB075',
    borderRadius: 5,
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  flatList: {
    flex: 1,
    backgroundColor: 'white',
  },
  emptyList: {
    marginTop: 40,
  },
  emptyListText: {
    ...commonStyles.text5,
    padding: 15,
  },
});

export const shiftStyles = StyleSheet.create({
  buttonContainerOuter: {
    marginHorizontal: 10,
    //backgroundColor: '#F5F5F5',
    padding: 10,
    //borderRadius: 10,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 5,
    marginTop: 10
  },
  buttonContainerInner: {
    margin: 5, marginBottom: 10
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  buttonRowInner: {
    width: '50%', marginBottom: 10
  },
  scrollView: {
    backgroundColor: 'white',
    height: '100%',
    //marginTop: 10,
  },
  container: {
    flex: 1,
    marginTop: 10
  },
  treeListContainer: {
    margin: 2,
    borderColor: '#5DB075',
    borderRadius: 5,
    flexDirection: 'row',
    marginTop: 0
    //backgroundColor: 'white',
  },
  flatList: {
    flex: 1,
    //backgroundColor: 'white',
  },
});

