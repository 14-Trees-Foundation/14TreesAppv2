import { StyleSheet } from "react-native";

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
        borderColor: '#A9A9A9'
    },
    label: {
        borderWidth: 2,
        borderColor: 'black',
        borderRadius: 5,
        fontSize: 15,
        alignContent: 'center',
        color: 'white',
        textAlign: 'center',
        textAlignVertical: 'center',
        padding: 5,
        margin: 5
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
        borderRadius: 5,
        flexDirection: 'row',
        backgroundColor: 'green',
        justifyContent: 'center',
        alignItems: 'center'
    },
    //Namrata
    borderedDisplay: {
        //borderColor: '#F2E47D', borderWidth: 3, borderRadius: 5, margin: 3, padding: 3
        borderColor: 'gray', borderWidth: 3, borderRadius: 5, margin: 3, padding: 3
    },
    defaultButtonStyle: {
        flexDirection: 'row',
        alignContent: 'center',
        alignItems: 'center',
        fontSize: 40,
        borderColor: 'gray',
        borderWidth: 3,
        backgroundColor: 'green',
        margin: 5,
        padding: 20,
        borderRadius: 5,
        shadowColor: 'black',
        elevation: 3,
        shadowOffset: {
            width: 50,
            height: 50
        },
        shadowOpacity: 1
    },
   
    dropdownOptions : {
        
            flexDirection: 'row',
            alignContent: 'center',
            alignItems: 'center',
            fontSize: 40,
            borderColor: 'gray',
            borderWidth: 3,
            backgroundColor: 'yellow',
            margin: 5,
            padding: 10,
            borderRadius: 5,
            shadowColor: 'black',
            elevation: 3,
            shadowOffset: {
                width: 50,
                height: 50
            },
            shadowOpacity: 1
        
    },
    dropdownOptionsContent: {
        color: 'black',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    defaultButtonTextStyle: {
        color: 'white',
        textAlign: 'center'
    },
    //Namrata
    drawerHeader: {
        backgroundColor: '#5DB075',
    },
    headerTitleStyle: {
        color: 'white'
    },
    logOutButton: {
        color: 'white',
        bottom: 0
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
        fontSize: 14,
        color: 'black',
        textAlign: 'left',
    },
    text2: {
        fontSize: 25,
        color: 'white',
        textAlign: 'center',
        marginVertical: 5,
        marginBottom: 40,
    },
    recordTxt: {
        fontSize: 18,
        color: '#1f3625',
        marginTop: 5,
        marginBottom: 5,
        textAlign: 'center',
    },
    btntxt: {
        fontSize: 18,
        color: '#ffffff',
        textAlign: 'center',
    },
    text4: {
        fontSize: 17,
        color: 'black',
        textAlign: 'left',
        padding: 5,
    },
    text5: {
        fontSize: 20,
        alignContent: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        color: 'black'
    },
    text3: {
        fontSize: 17,
        color: 'black',
        textAlign: 'left',
        margin: 2,
    },
    text6: {
        fontSize: 17,
        color: 'black',
        textAlign: 'left',
        backgroundColor: 'white',
        borderRadius: 3
    },
    //Namrata
    txtInput: {
        height: 60,
        width: 310,
        borderWidth: 1.5,
        borderColor: 'grey',
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
        //backgroundColor:"white",
        marginTop: 10,
        marginBottom: 10,
        padding: 10,
        color: 'black', // Change font color here
        fontSize: 16,
        fontWeight: 'bold',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    headerText: {
        fontSize: 30, color: 'white', textAlign: 'center', marginTop: 30, marginBottom: 30, fontFamily: 'cochin', fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
});

export const styleConfigs = {
    drawerHeaderOptions: {
        headerStyle: commonStyles.drawerHeader,
        headerTitleStyle: commonStyles.headerTitleStyle,
        headerTintColor: commonStyles.headerTitleStyle.color
    }
}
