import AsyncStorage from '@react-native-async-storage/async-storage';
import LocalizedStrings from 'react-native-localization';
import { Constants } from './Utils';
import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';

export class Strings{
    static languageEvent = new EventEmitter();
    static screenNames = new LocalizedStrings({
        "en":{
            HomePage:"Home",
            AddTree:"Add Tree",
            localDataView:"Local Data",
            VerifyUsers:"Verify Users",
            EditTree:"Edit Tree",
            LogIn:'Log In',
            DrawerScreen:'Homescreen',
            startScreen:'start',
        },
        "mr":{

            HomePage:"मुख्य पृष्ठ",
            AddTree:"नवीन झाड जोडा",
            localDataView:"लोकल डेटा",
            VerifyUsers:"वापरकर्ते सत्यापित करा",
            EditTree:"झाड संपादन",
            LogIn:'लॉग इन',
            DrawerScreen:'होम स्क्रीन',
            startScreen:'प्रारंभ स्क्रीन',
        }
    })

    // text strings
    static languages = new LocalizedStrings({
        "en": {
            LogIn:"Login",
            SignIn:"Sign In",
            // home
            Never:"Never",
            LastSynced:"Last Synced: ",
            // add tree
            Location:"Tree Location",   
            CapturedAt:"Captured At",
            userLocation:"User Location",
            // local data view
            NoTreesFound:"No Trees Found on phone",
            Filters:"Filters",  
            LoadingTrees:"Loading Trees...",
            SaplingNo:"Sapling ID: ",
            TypeId : "Type ID: ",
            PlotId : "Plot ID: ",
            Synced:"Synced",
            Local:"Local",
            NoImageFound:"No Image Found",
            //verify users
            ListUnverifiedUsers:"List of Unverified Users",
            Name:"Name: ",
            Email:"Email: ",
            //Edit tree
            EnterSaplingId:" Enter the Sapling ID",
        },
        "mr": {
            SignIn:"साइन इन करा",
            LogIn:"लॉग इन",
            // home
            Never:"कधीच नाही",
            LastSynced:"शेवटचा सिंक केलेला डेटा : ",
            // add tree
            Location:"स्थान",
            CapturedAt:"फोटो घेतले तारीख",
            // local data view
            NoTreesFound:"फोनवर झाडे आढळली नाहीत",
            Filters:"फिल्टर",
            LoadingTrees:"झाडे लोड होत आहेत...",
            SaplingNo:"रोप क्र: ",
            TypeId : "प्रकार क्र: ",
            PlotId : "प्लॉट क्र: ",
            Synced:"सिंक केले गेले",
            Local:"लोकल",
            NoImageFound:"फोटो नाही",
            //verify users
            ListUnverifiedUsers:"असत्यापित वापरकर्त्यांची यादी",
            Name:"नाव : ",
            Email:"ईमेल : ",
            //Edit tree
            EnterSaplingId:"रोपाची संख्या लिहा",
            
        },
    });
    static alertMessages = new LocalizedStrings({
        "en":{
            //login
            LoginFailed:"Login Failed",
            CheckPhoneNumber:"Check phone number.",
            UnknownError:"Unknown error. Consult an expert.",
            //app
            PermissionsRequired:"Permissions Required!",
            Settings:"Please go to Settings and grant permissions",
            //utils
            DataUptodate:"Tree types and plot already up to date.",
            plotSaplingsDataUpToDate:"Plot sapling data up-to-date",
            FailureSavingTrees:"Failed to save some tree types. See logs.",
            FailureSavingPlots:"Failed to save some plots. See logs.",
            ConfirmActionTitle:"Are you sure?",
            ConfirmActionMsg:"Please confirm the action.",
            Yes:"Yes",
            No:"No",
            SyncSuccess:"Sync Successful!",
            SyncFailure:"Sync Failed!",
            CheckLocalList:"See local tree list to check statuses.",
            ContactExpert:"Contact an expert, please.",
            //tree form
            Error:"Error",
            IncompleteFields:"Please fill all fields.",
            NoImage:"Please add atleast one image.",
            //verify users
            UserVerified:"User Verified",
            //localdataview
            NoTreeswithFilter:"No trees found with given filters",
            //edit tree
            TreeUpdatedfirsthalf:"Tree with id : ",
            TreeUpdatedsecondhalf:" updated successfully.",
            // DataServive
            FailedAtServer:"Request failed at server: ",
            RequestToBeSent:"Request to be sent: ",
            //coordinate setter
            LocationError:"Have you turned on the location (GPS) on your phone?",
            //add tree
            TreeSaved:"Tree saved locally!",
            //treedb
            FailedGetTreedata:"Failed to get treedata !",
            FailedGetTreeImgdata:"Failed to get treeimgdata !",
            FailedTreeCount:"Failed to get tree count !",
            ErrorSetFalse:"Error while setting false",
            FailedTreeNames:"Failed to get tree names !",
            FailedPlotNames:"Failed to get plot names !",
            FailedSaplingIds:"Failed to get sapling ids !",
        },
        "mr":{
            //login
            LoginFailed:"लॉग इन अयशस्वी",
            CheckPhoneNumber:"फोन नंबर तपासा.",
            UnknownError:"अज्ञात त्रुटी. एक तज्ञाशी संपर्क साधा.",
            //app
            PermissionsRequired:"परवानगी आवश्यक!",
            Settings:"कृपया सेटिंग्ज वर जाऊन परवानगी द्या",
            //utils
            DataUptodate:"झाडाचे प्रकार आणि प्लॉट अद्याप अपडेट आहेत.",
            plotSaplingsDataUpToDate:"Plot sapling data up-to-date (MR)",
            FailureSavingTrees:"काही झाडाचे प्रकार सेव करण्यात असफल. लॉग पहा.",
            FailureSavingPlots:"काही प्लॉट सेव करण्यात असफल. लॉग पहा.",
            ConfirmActionTitle:"खात्री आहे का?",
            ConfirmActionMsg:"कृपया कृतीची पुष्टी करा.",
            Yes:"होय",
            No:"नाही",
            SyncSuccess:"समक्रमण यशस्वी!",
            SyncFailure:"समक्रमण अयशस्वी!",
            CheckLocalList:" लोकल झाडांची यादी पहा स्थिती तपासण्यासाठी.",
            ContactExpert:"कृपया एक तज्ञाशी संपर्क साधा.",
            //tree form
            Error:"त्रुटी",
            IncompleteFields:"कृपया सर्व रिक्त जागा भरा.",
            NoImage:"कृपया किमान एक फोटो घ्या.",
            //verify users
            UserVerified:"वापरकर्ता सत्यापित केला गेला",
            
            //localdataview
            NoTreeswithFilter:"दिलेल्या फिल्टरशी झाडे आढळली नाहीत",
            //edit tree
            TreeUpdatedfirsthalf:"झाड : ",
            TreeUpdatedsecondhalf:" अपडेट केले.",
            // DataServive
            FailedAtServer:"सर्व्हरवर विनंती अयशस्वी झाली ",
            RequestToBeSent:"पाठवण्याची विनंती: ",
            //coordinate setter
            LocationError:"तुम्ही फोनवर लोकेशन (GPS) सुरू केली आहे का?",
            //add tree
            TreeSaved:"झाड लोकली सेव्ह केले!",
            //treedb
            FailedGetTreedata:"झाडाचे डेटा मिळविण्यात असफल !",
            FailedGetTreeImgdata:"झाडाचे फोटो मिळविण्यात असफल !",
            FailedTreeCount:"झाडाची संख्या मिळविण्यात असफल !",
            ErrorSetFalse:"अपलोड स्थिती असत्य वर सेट करताना त्रुटी",
            FailedTreeNames:"झाडाचे नाव मिळविण्यात असफल !",
            FailedPlotNames:"प्लॉट नाव मिळविण्यात असफल !",
            FailedSaplingIds:"रोपाची संख्या मिळविण्यात असफल !",
        }
    })
    static buttonLabels = new LocalizedStrings({
        "en":{
            // home
            SyncData:"Sync Data",
            AddNewTree:"Add New Tree",
            FetchHelperData:"Fetch Helper Data",
            SelectLanguage:"Select Language",
            // add tree
            ClickPhoto:"Click Photo",
            Submit:"Submit",
            // local data view
            DeleteSyncedTrees:"Delete Synced Trees",
            Filters:"Filters",
            ClearFilters:"Clear Filters",
            Apply:"Apply",
            //verify users
            Refresh:"Refresh",
            Verify:"Verify",
            //edit tree
            Search:"Search",
        },
        "mr":{
            // home
            SyncData:"डेटा सिंक करा",
            AddNewTree:"नवीन झाड जोडा",
            FetchHelperData:"मदतकारी डेटा तयार करा",
            SelectLanguage:"भाषा निवडा",
            // add tree
            ClickPhoto:"फोटो घ्या",
            Submit:"सबमिट करा",
            // local data view
            DeleteSyncedTrees:"सिंक केलेले झाडे हटवा",
            Filters:"फिल्टर",
            ClearFilters:"फिल्टर काढा",
            Apply:"लागू करा",
            //verify users
            Refresh:"रिफ्रेश करा",
            Verify:"सत्यापित करा",
            //edit tree
            Search:"शोधा",
        }
    })
    static labels = new LocalizedStrings({
        "en":{
            //add tree
            SaplingId:"Sapling Id",
            SelectTreeType:"Select Tree Type",
            SelectPlot:"Select Plot",
            //local data view
            UploadStatus:"Upload Status",
            TreeType: "Tree Type",
            Plot: "Plot",
        },
        "mr":{
            //add tree
            SaplingId:"रोपाची संख्या",
            SelectTreeType:"झाडाचा प्रकार निवडा",
            SelectPlot:"प्लॉट निवडा",
            //local data view
            UploadStatus:"अपलोड स्थिती",
            TreeType: "झाडाचा प्रकार",
            Plot: "प्लॉट",
        }
    })
    static english  = 'en';
    static marathi = 'mr';
    static setLanguage = async (langidx) => {
        var lang = langidx;
        await AsyncStorage.setItem(Constants.selectedLangKey, lang);
        this.languages.setLanguage(lang);
        this.alertMessages.setLanguage(lang);
        this.screenNames.setLanguage(lang);
        this.buttonLabels.setLanguage(lang);
        this.labels.setLanguage(lang);
        this.languageEvent.emit('change');
    }

    // get currently set language

    static getLanguage = async () => {
        var lang = await AsyncStorage.getItem(Constants.selectedLangKey);
        // console.log('language fetched: ',lang);
       return lang;
    }



}