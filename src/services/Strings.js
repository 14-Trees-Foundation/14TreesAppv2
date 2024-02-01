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
            LocalDataView:"Local Data",
            LocalDataNavigator:"LocalDataNavigator",
            VerifyUsers:"Verify Users",
            EditTree:"Edit Tree",
            EditLocalTree:"Edit Local Tree",
            LogIn:'Log In',
            DrawerScreen:'Homescreen',
            startScreen:'start',
        },
        "mr":{

            HomePage:"मुख्य पृष्ठ",
            AddTree:"नवीन झाड जोडा",
            LocalDataView:"लोकल डेटा",
            LocalDataNavigator:"LocalDataNavigator",
            VerifyUsers:"वापरकर्ते सत्यापित करा",
            EditTree:"झाड संपादन",
            EditLocalTree:"एक स्थानिक झाड संपादित करा",
            LogIn:'लॉग इन',
            DrawerScreen:'होम स्क्रीन',
            startScreen:'प्रारंभ स्क्रीन',
        }
    })

    // text strings
    static messages = new LocalizedStrings({
        "en": {
            LogIn:"Login",
            SignIn:"Sign In",
            // home
            Never:"Never",
            LastSynced:"Last Synced: ",
            pending:"Pending",
            synced:"Synced",
            LocalOrSynced:"Local Or Synced",
            failedToUpload:"Failed to upload",
            trees:"trees",
            // add tree
            Location:"Tree Location",   
            CapturedAt:"Captured At",
            userLocation:"User Location",
            confirmSetGPS:"Set tree location current GPS coordinates?",
            confirmCoordinateEdit:"Set tree location to given coordinates?",
            confirmDrag:"Set tree location to dragged coordinates?",
            enterRemark:"Enter Remark",
            defaultRemark:"Default Remark",
            // local data view
            NoTreesFound:"No Trees Found on phone",
            Filters:"Filters",  
            LoadingTrees:"Loading Trees...",
            SaplingNo:"Sapling ID",
            Type : "Type",
            Plot : "Plot",
            Synced:"Synced",
            Local:"Local",
            NoImageFound:"No Image Found",
            //verify users
            ListUnverifiedUsers:"List of Unverified Users",
            Name:"Name: ",
            Email:"Email: ",
            //Edit tree
            EnterSaplingId:" Enter the Sapling ID",
            //general:
            logoutConfirm:"Do you want to log out?"
        },
        "mr": {
            SignIn:"साइन इन करा",
            LogIn:"लॉग इन",
            // home
            Never:"कधीच नाही",
            LastSynced:"शेवटचा सिंक केलेला डेटा : ",
            pending:"प्रलंबित",
            synced:"समक्रमित",
            LocalOrSynced:"स्थानिक किंवा समक्रमित",
            failedToUpload:"अपलोड करण्यात अयशस्वी",
            trees:"झाडे",
            // add tree
            Location:"स्थान",
            CapturedAt:"फोटो घेतले तारीख",
            userLocation:"वापरकर्ता स्थान",
            confirmSetGPS:"वृक्ष स्थान वर्तमान GPS निर्देशांक सेट करायचे?",
            confirmCoordinateEdit:"दिलेल्या निर्देशांकांवर झाडाचे स्थान सेट करायचे?",
            confirmDrag:"ड्रॅग केलेल्या निर्देशांकांवर झाडाचे स्थान सेट करायचे?",
            enterRemark:"टिप्पणी प्रविष्ट करा",
            defaultRemark:"डीफॉल्ट टिप्पणी",
            // local data view
            NoTreesFound:"फोनवर झाडे आढळली नाहीत",
            Filters:"फिल्टर",
            LoadingTrees:"झाडे लोड होत आहेत...",
            SaplingNo:"रोप क्र",
            Type : "प्रकार",
            Plot : "प्लॉट",
            Synced:"सिंक केले गेले",
            Local:"लोकल",
            NoImageFound:"फोटो नाही",
            //verify users
            ListUnverifiedUsers:"असत्यापित वापरकर्त्यांची यादी",
            Name:"नाव : ",
            Email:"ईमेल : ",
            //Edit tree
            EnterSaplingId:"रोपाची संख्या लिहा",
            logoutConfirm:"तुम्हाला लॉग आउट करायचे आहे का?"
        },
    });
    static alertMessages = new LocalizedStrings({
        "en":{
            //login
            LoginFailed:"Login Failed",
            GPSUnavailable:"Error: Request timed out. GPS not available right now.",
            gpsActionMessage:"Turn on location services and/or mobile data, and restart the app.",
            CheckPhoneNumber:"Check phone number.",
            UnknownError:"Unknown error. Consult an expert.",
            userCancelled:"User cancelled the login flow",
            signIninProgress:"Operation (e.g. sign in) is in progress already",
            playServicesOutdated:"Play services not available or outdated",
            someError:"Some unidentified error happened",
            //app
            PermissionsRequired:"Permissions Required!",
            Settings:"Please go to Settings and grant permissions",
            //utils
            DataUptodate:"Tree types and plot up to date.",
            plotSaplingsDataUpToDate:"Plot sapling data up-to-date",
            FailureSavingTrees:"Failed to save some tree types. See logs.",
            FailureSavingPlots:"Failed to save some plots. See logs.",
            FailureSavingSaplings :"Failed to save some sapling_ids. See logs",
            ConfirmActionTitle:"Are you sure?",
            ConfirmActionMsg:"Please confirm the action.",
            Yes:"Yes",
            No:"No",
            SyncSuccess:"Sync Successful!",
            SyncFailure:"Sync Failed!",
            CheckLocalList:"See local tree list to check statuses.",
            ContactExpert:"Contact an expert, please.",
            //tree form
            invalidSaplingId:"Invalid Sapling Id",
            alreadyExists:"already exists in local data.",
            alreadyExistsInDB :"exists in database. Enter Unique Sapling id.",
            Error:"Error",
            IncompleteFields:"Please fill all fields.",
            NoImage:"Please add atleast one image.",
            selectPlotFirst:"Select plot to view other trees.",
            confirmDeleteImage:"Delete image?",
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
            IncorrectUser: "Incorrect User",
            userNotAuthorized: "user not authorized to access app. contact admin",
            userNotSetup: "user not set up correctly. contact admin"
        },
        "mr":{
            GPSUnavailable:"त्रुटी: विनंतीची वेळ संपली. GPS सध्या उपलब्ध नाही.",
            gpsActionMessage:"स्थान सेवा आणि/किंवा मोबाइल डेटा चालू करा आणि अॅप रीस्टार्ट करा.",
            //login
            LoginFailed:"लॉग इन अयशस्वी",
            CheckPhoneNumber:"फोन नंबर तपासा.",
            UnknownError:"अज्ञात त्रुटी. एक तज्ञाशी संपर्क साधा.",
            userCancelled:"वापरकर्त्याने लॉगिन प्रवाह रद्द केला.",
            signIninProgress:"ऑपरेशन (उदा. साइन इन) आधीच प्रगतीपथावर आहे.",
            playServicesOutdated:"प्ले सेवा उपलब्ध नाहीत किंवा कालबाह्य आहेत",
            someError:"काही अज्ञात त्रुटी घडली",
            //app
            PermissionsRequired:"परवानगी आवश्यक!",
            Settings:"कृपया सेटिंग्ज वर जाऊन परवानगी द्या",
            //utils
            DataUptodate:"झाडाचे प्रकार आणि प्लॉट अद्याप अपडेट आहेत.",
            plotSaplingsDataUpToDate:"प्लॉट रोपटी डेटा अद्ययावत.",
            FailureSavingTrees:"काही झाडाचे प्रकार सेव करण्यात असफल. लॉग पहा.",
            FailureSavingPlots:"काही प्लॉट सेव करण्यात असफल. लॉग पहा.",
            ConfirmActionTitle:"खात्री आहे का?",
            ConfirmActionMsg:"कृपया कृतीची पुष्टी करा.",
            Yes:"होय",
            No:"नाही",
            SyncSuccess:"समक्रमण यशस्वी!",
            SyncFailure:"समक्रमण अयशस्वी!",
            CheckLocalList:"लोकल झाडांची यादी पहा स्थिती तपासण्यासाठी.",
            ContactExpert:"कृपया एक तज्ञाशी संपर्क साधा.",
            //tree form
            invalidSaplingId:"अवैध रोपटी आयडी",
            alreadyExists:"लोकल डेटामध्ये आधीपासूनच अस्तित्वात आहे.",
            alreadyExistsInDB :"डेटाबेसमध्ये आधीपासूनच अस्तित्वात आहे. नवीन सेपलिंग आयडी एंटर करा.",
            Error:"त्रुटी",
            IncompleteFields:"कृपया सर्व रिक्त जागा भरा.",
            NoImage:"कृपया किमान एक फोटो घ्या.",
            selectPlotFirst:"इतर झाडे पाहण्यासाठी प्लॉट निवडा.",
            confirmDeleteImage:"इमेज हटवायची??",
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
            IncorrectUser: "चुकीचा वापरकर्ता",
            userNotAuthorized: "वापरकर्ता ॲपमध्ये प्रवेश करण्यास अधिकृत नाही. प्रशासकाशी संपर्क साधा",
            userNotSetup: "वापरकर्ता योग्यरित्या सेट नाही. प्रशासकाशी संपर्क साधा"
        }
    })
    static buttonLabels = new LocalizedStrings({
        "en":{
            // home
            SyncData:"Sync Data",
            AddNewTree:"Add New Tree",
            FetchHelperData:"Fetch Helper Data",
            fetchPlotSaplingData:"Fetch Plot-Sapling Data",
            SelectLanguage:"Language/भाषा",

            // add tree
            ClickPhoto:"Click Photo",
            Submit:"Submit",
            gps:"GPS",
            edit:"Edit",
            drag:"Drag",
            hideAll:"Hide All",
            showAll:"Show All",
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
            //general:
            save:"Save",
            cancel:"Cancel",
            logOut:'Log out',
        },
        "mr":{
            // home
            SyncData:"डेटा सिंक करा",
            AddNewTree:"नवीन झाड जोडा",
            FetchHelperData:"मदतकारी डेटा तयार करा",
            fetchPlotSaplingData:"प्लॉट-सॅपलिंग डेटा मिळवा",
            SelectLanguage:"भाषा/Language",
            // add tree
            ClickPhoto:"फोटो घ्या",
            Submit:"सबमिट करा",
            gps:"जीपीएस",
            edit:"सुधारणे",
            drag:"ड्रॅग करा",
            hideAll:"सर्व लपवा",
            showAll:"सगळं दाखवा",
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
            //general:
            save:"जतन करा",
            cancel:"रद्द करा",
            logOut:'बाहेर पडणे',

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
            //general
            admin:'Admin',
            logger:'Logger'
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
            admin:'प्रशासक',
            logger:'माली'
        }
    })
    static english  = 'en';
    static marathi = 'mr';
    static setLanguage = async (langidx) => {
        var lang = langidx;
        await AsyncStorage.setItem(Constants.selectedLangKey, lang);
        this.messages.setLanguage(lang);
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