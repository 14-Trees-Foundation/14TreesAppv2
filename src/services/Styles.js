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
  //Namrata
  borderText: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  borderedDisplay: {
    //borderColor: '#F2E47D', borderWidth: 3, borderRadius: 5, margin: 3, padding: 3
    borderColor: '#ccc',
    borderWidth: 2,
    borderRadius: 5,
    margin: 5,
    padding: 3,
    marginTop: 10
  },
  borderedDisplay2: {
    //borderColor: '#F2E47D', borderWidth: 3, borderRadius: 5, margin: 3, padding: 3
    borderColor: '#ccc',
    borderWidth: 0,
    borderRadius: 5,
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
  //Namrata #FFD700
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
  //namrata
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
  //namrata
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
  //Namrata

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
    fontFamily: 'cochin',
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

  //manjur
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

// export const styleConfigs = {
//   drawerHeaderOptions: {
//     headerStyle: commonStyles.drawerHeader,
//     headerTitleStyle: commonStyles.headerTitleStyle,
//     headerTintColor: commonStyles.headerTitleStyle.color,
//   },
// };
