import AsyncStorage from '@react-native-async-storage/async-storage';
import LocalizedStrings from 'react-native-localization';
import { Constants } from './Utils';
import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';

export class Strings {
    static languageEvent = new EventEmitter();
    static screenNames = new LocalizedStrings({
        "en": {
            HomePage: "Home",
            TreesPage: "Trees",
            PlotsPage: "Plots",
            SitesPage: "Sites",
            VisitsPage: "Visits",
            AddTreeShift: "Add Tree",
            LocalDataView: "Local Data",
            LocalDataNavigator: "LocalDataNavigator",
            VerifyUsers: "Verify Users",
            EditTree: "Edit Tree",
            EditLocalTree: "Edit Local Tree",
            EditLocalAddImage: "Edit Local Image",
            LogIn: 'Log In',
            DrawerScreen: 'Homescreen',
            startScreen: 'start',
            Shifts: "Shifts", //manjur
            AddImageShift: "Add Tree Image",
            UpdatePlotShift: "Update Tree Plot",
            AppInfo: "App Info",
            Dev: "Dev",
            ChangePlot: "Change Plot",
            TreesInShift: "Trees In Shift", //manjur
            PlotSelect: "Select Plot",
            SyncDisplay: "Sync Data", //manjur
            LoadingScreen: 'Load',
            UpdateSaplingsPlot: "UpdateSaplingsPlot",
            UsersPage: "Users",
        },
        "mr": {
            HomePage: "मुख्य पृष्ठ",
            TreesPage: "झाडे",
            PlotsPage: "भूखंड",
            SitesPage: "साइट्स",
            VisitsPage: "भेटी",
            AddTreeShift: "नवीन झाड जोडा",
            LocalDataView: "लोकल डेटा",
            LocalDataNavigator: "LocalDataNavigator",
            VerifyUsers: "वापरकर्ते सत्यापित करा",
            EditTree: "झाड संपादन",
            EditLocalTree: "झाड संपादित करा",
            EditLocalAddImage: "प्रतिमा संपादित करा",
            LogIn: 'लॉग इन',
            DrawerScreen: 'होम स्क्रीन',
            startScreen: 'प्रारंभ स्क्रीन',
            Shifts: "शिफ्ट",
            //Shift: "शिफ्ट",
            AddImageShift: "अ‍ॅड सॅपलिंग इमेज",
            UpdatePlotShift: "सॅपलिंग प्लॉट अपडेट",
            AppInfo: "अ‍ॅपची माहिती",
            Dev: "देव",
            ChangePlot: "प्लॉट बदला",
            TreesInShift: "शिफ्ट मधील झाडे", //manjur
            PlotSelect: "प्लॉट निवडा", //manjur
            SyncDisplay: "सिंक डेटा",
            LoadingScreen: 'लोड',
            UpdateSaplingsPlot: "झाडाचा प्लॉट अपडेट करा",
            UsersPage: "वापरकर्ते",
        }
    })

    // text strings
    static messages = new LocalizedStrings({
        "en": {
            LogIn: "Login",
            SignIn: "Sign In",
            // home
            Never: "Never",
            LastSynced: "Last Synced: ",
            pending: "Pending",
            pendingTrees: "New Trees",
            pendingImages: "Tree Images",
            pendingPlotTrees: "Updated Plot Trees",
            synced: "Synced",
            LocalOrSynced: "Local Or Synced",
            failedToUpload: "Could not upload",
            failedToUpdate: "Could not update plot for",
            couldNotAdd: "Could not add images for",
            trees: "trees",
            // add tree
            Location: "Tree Location",
            CapturedAt: "Captured At",
            userLocation: "User Location",
            confirmSetGPS: "Set tree location current GPS coordinates?",
            confirmCoordinateEdit: "Set tree location to given coordinates?",
            confirmDrag: "Set tree location to dragged coordinates?",
            enterRemark: "Enter Remark",
            defaultRemark: "Default Remark",
            // local data view
            NoTreesFound: "No Trees Found on phone",
            NoTreesWithAddedImage: "No Trees with Added Image",
            NoShiftTree: "No Trees planted in this shift",//manjur
            NoShiftsFound: "No Shifts Found",//manjur
            AllShifts: "All Shifts", //manjur
            NoTreesInShift: "No Trees Added in the shift",
            Filters: "Filters",
            LoadingTrees: "Loading Trees...",
            SaplingNo: "Sapling ID",
            ShiftNo: "Shift ID",
            Type: "Type",
            Plot: "Plot",
            Trees: 'Trees',
            OldPlot: "Old Plot",
            NewPlot: "New Plot",
            Synced: "Synced",
            Local: "Local",
            NoImageFound: "No Image Found",
            //verify users
            ListUnverifiedUsers: "List of Unverified Users",
            Name: "Name: ",
            Email: "Email: ",
            //Edit tree
            EnterSaplingId: " Enter the Sapling ID",
            EnterPlotName: "Select the Plot",
            OldPlotName: "Select Old Plot",
            NewPlotName: "Select New Plot",
            //general:
            logoutConfirm: "Do you want to log out?",
            PlotName: "Plot Name",
            Shift: "shift", //manjur
            ClickToDelete: "Click on saplings to delete the entry",
            ShiftType: "Shift type",
            StartThisShift: "Start this Shift",

            // users
            NewUsers: "New Users",

            // Analytics
            TotalTrees: 'Total Trees Planted Till Date',
            YearTrees: 'Trees Planted This Year',
            MonthTrees: 'Trees Planted This Month',
            PersonTrees: 'Trees Planted By You!',

            // Sync
            LocalChanges: 'Local Changes',
            New: 'New',
            Updated: 'Updated',
            Deleted: 'Deleted',
            VisitImages: 'Visit Images',
            TreeImages: 'Tree Images',
            Completed: 'Completed',

            UploadingLocal: 'Uploading Local Changes!',
            FetchingChanges: 'Fetching New Changes from Server!',

            SyncHistory: 'Sync History',
            CurrentSync: 'Current Sync',
            StartTime: 'Start Time',
            UploadTime: 'Upload Time',
            UploadError: 'Upload Error',
            FetchTime: 'Fetch Time',
            FetchError: 'Fetch Error',
            NoDataUploaded: 'No data was uploaded in this sync.',
            UploadingChanges: 'Uploading changes...',

            NetworkSpeed: 'Network Speed',
            EstimatedTimeToSync: 'Estimated Time to Sync',
            WishToContinue: 'Do you wish to sync the data?',

            // Visits
            AddVisit: 'Add Visit',
            EditVisit: 'Edit Visit',

            // Trees
            AddVisitorDetails: 'Add Visitor Details?',
            AddTree: 'Add Tree',
            EditTree: 'Edit Tree',
            AddTreeImages: 'Add Tree Images For Sapling',
            TreeImages: 'Tree Images',
            ImageDate: "Image date different than today's date?",
        },
        "mr": {
            SignIn: "साइन इन करा",
            LogIn: "लॉग इन",
            // home
            Never: "कधीच नाही",
            LastSynced: "शेवटचा सिंक केलेला डेटा : ",
            pending: "प्रलंबित",
            pendingTrees: "नवीन झाडे",
            pendingImages: "नवीन प्रतिमासह झाडे",
            pendingPlotTrees: "अपडेटेड प्लॉटसह झाडे",
            synced: "समक्रमित",
            LocalOrSynced: "स्थानिक किंवा समक्रमित",
            failedToUpload: "अपलोड करू शकलो नाही",
            failedToUpdate: "साठी प्लॉट अपडेट करू शकलो नाही",
            couldNotAdd: "साठी प्रतिमा जोडू शकलो नाही",
            Trees: "झाडे",
            trees: "झाडे",
            // add tree
            Location: "स्थान",
            CapturedAt: "फोटो घेतले तारीख",
            userLocation: "वापरकर्ता स्थान",
            confirmSetGPS: "वृक्ष स्थान वर्तमान GPS निर्देशांक सेट करायचे?",
            confirmCoordinateEdit: "दिलेल्या निर्देशांकांवर झाडाचे स्थान सेट करायचे?",
            confirmDrag: "ड्रॅग केलेल्या निर्देशांकांवर झाडाचे स्थान सेट करायचे?",
            enterRemark: "टिप्पणी प्रविष्ट करा",
            defaultRemark: "डीफॉल्ट टिप्पणी",
            // local data view
            NoTreesFound: "फोनवर झाडे आढळली नाहीत",
            NoTreesWithAddedImage: "नवीन प्रतिमा जोडलेली झाडे नाहीत",
            NoShiftTree: "या शिफ्टमध्ये झाडे लावलेली नाहीत",//manjur
            NoShiftsFound: "कोणत्याही शिफ्ट आढळल्या नाहीत", //manjur
            NoTreesInShift: "शिफ्टमध्ये कोणतीही झाडे जोडलेली नाहीत", //manjur
            AllShifts: "सर्व शिफ्ट", //manjur
            Filters: "फिल्टर",
            LoadingTrees: "झाडे लोड होत आहेत...",
            SaplingNo: "रोप क्र",
            ShiftNo: "शिफ्ट आयडी", //manjur
            Type: "प्रकार",
            Plot: "प्लॉट",
            OldPlot: "जुना प्लॉट",
            NewPlot: "नवीन प्लॉट",
            Synced: "सिंक केले गेले",
            Local: "लोकल",
            NoImageFound: "फोटो नाही",
            //verify users
            ListUnverifiedUsers: "असत्यापित वापरकर्त्यांची यादी",
            Name: "नाव : ",
            Email: "ईमेल : ",
            //Edit tree
            EnterSaplingId: "रोपाची संख्या लिहा",
            EnterPlotName: "प्लॉटचे नाव निवडा", //manjur
            OldPlotName: "जुना प्लॉट निवडा", //manjur
            NewPlotName: "नवीन प्लॉट निवडा",
            PlotName: "प्लॉटचे नाव",
            logoutConfirm: "तुम्हाला लॉग आउट करायचे आहे का?",
            Shift: "शिफ्ट",
            ClickToDelete: "एंट्री हटवण्यासाठी रोपावर क्लिक करा", //manjur
            ShiftType: "शिफ्ट प्रकार",
            StartThisShift: "ही शिफ्ट सुरू करा",

            // users
            NewUsers: "नवीन वापरकर्ते",

            // Analytics
            TotalTrees: 'आजपर्यंत लावलेली एकूण झाडे',
            YearTrees: 'यावर्षी लावलेली झाडे',
            MonthTrees: 'या महिन्यात लावलेली झाडे',
            PersonTrees: 'तुम्ही लावलेली झाडे!',

            // Sync
            LocalChanges: 'स्थानिक बदल',
            New: 'नवीन',
            Updated: 'अपडेट केले',
            Deleted: 'हटवले',
            VisitImages: 'प्रतिमांना भेट द्या',
            TreeImages: 'वृक्ष प्रतिमा',
            Completed: 'पूर्ण झाले',

            UploadingLocal: 'स्थानिक बदल अपलोड करत आहे!',
            FetchingChanges: 'सर्व्हरवरून नवीन बदल आणत आहे!',

            SyncHistory: 'सिंक इतिहास',
            CurrentSync: 'वर्तमान समक्रमण',
            StartTime: 'प्रारंभ वेळ',
            UploadTime: 'अपलोड वेळ',
            UploadError: 'अपलोड त्रुटी',
            FetchTime: 'वेळ आणा',
            FetchError: 'आणणे त्रुटी',
            NoDataUploaded: 'या सिंकमध्ये कोणताही डेटा अपलोड केला गेला नाही.',
            UploadingChanges: 'बदल अपलोड करत आहे...',

            NetworkSpeed: 'नेटवर्क गती',
            EstimatedTimeToSync: 'सिंक करण्यासाठी अंदाजे वेळ',
            WishToContinue: 'तुम्ही डेटा समक्रमित करू इच्छिता?',

            // Visits
            AddVisit: 'भेट जोडा',
            EditVisit: 'भेट संपादित करा',

            // Trees
            AddVisitorDetails: 'अभ्यागत तपशील जोडायचे?',
            AddTree: 'झाड जोडा',
            EditTree: 'झाड संपादित करा',
            AddTreeImages: 'रोपट्यासाठी वृक्ष प्रतिमा जोडा',
            TreeImages: 'वृक्ष प्रतिमा',
            ImageDate: "चित्राची तारीख आजच्या तारखेपेक्षा वेगळी आहे का?",
        },
    });
    static alertMessages = new LocalizedStrings({
        "en": {
            //login
            LoginFailed: "Login Failed",
            GPSUnavailable: "Error: Request timed out. GPS not available right now.",
            gpsActionMessage: "Turn on location services and/or mobile data, and restart the app.",
            CheckPhoneNumber: "Check phone number.",
            UnknownError: "Unknown error. Consult an expert.",
            userCancelled: "User cancelled the login flow",
            signIninProgress: "Operation (e.g. sign in) is in progress already",
            playServicesOutdated: "Play services not available or outdated",
            someError: "Some unidentified error happened",
            CorrectPhoneNumber: "Please enter 10 digits number",
            CorrectPin: "Please enter 4 digit pin number",
            //app
            PermissionsRequired: "Permissions Required!",
            Settings: "Please go to Settings and grant permissions",
            //utils
            DataUptodate: "Tree types and plot up to date.",
            DataGettingFetched: "Please wait while helper data is being fetched.",
            ShiftDataUptodate: "Shift data up to date",
            plotSaplingsDataUpToDate: "Plot sapling data up-to-date",
            FailureSavingTrees: "Failed to save some tree types. See logs.",
            FailureSavingPlots: "Failed to save some plots. See logs.",
            FailureSavingSaplings: "Failed to save some sapling_ids. See logs",
            ConfirmActionTitle: "Are you sure?",
            ConfirmActionMsg: "Please confirm the action.",
            Yes: "Yes",
            No: "No",
            SyncSuccess: "Sync Successful!",
            SyncFailure: "Sync Could not Complete!",
            SyncFailureForTrees: "Sync for added trees Failed!",
            SyncFailureForImages: "Sync for added Images Failed!",
            SyncFailureForShifts: "Sync for Shifts Failed",
            NothingToSync: "No trees to sync. Please Add trees",
            CheckLocalList: "See local tree list to check statuses.",
            ContactExpert: "Contact an expert, please.",
            //tree form
            invalidSaplingId: "Invalid Sapling Id",
            alreadyExists: "already exists in local data.",
            doesNotExist: "does not exist",
            alreadyExistsInDB: "exists in database. Enter Unique Sapling id.",
            Error: "Error",
            IncompleteFields: "Please fill all fields.",
            NoImage: "Please add atleast one image.",
            NoTreeLoaction: "Please locate the tree", //manjur
            selectPlotFirst: "Select plot to view other trees.",
            confirmDeleteImage: "Delete image?",
            confirmDeleteSapling: "Delete Sapling?",
            //verify users
            UserVerified: "User Verified",
            //localdataview
            NoTreeswithFilter: "No trees found with given filters",
            //edit tree
            TreeUpdatedfirsthalf: "Tree with id : ",
            TreeUpdatedsecondhalf: " updated successfully.",
            // DataServive
            FailedAtServer: "Request failed at server: ",
            RequestToBeSent: "Request to be sent: ",
            //coordinate setter
            LocationError: "Have you turned on the location (GPS) on your phone?",
            //add tree
            TreeSaved: "Tree saved locally!",
            //treedb
            FailedGetTreedata: "Failed to get treedata !",
            FailedGetTreeImgdata: "Failed to get treeimgdata !",
            FailedTreeCount: "Failed to get tree count !",
            ErrorSetFalse: "Error while setting false",
            FailedTreeNames: "Failed to get tree names !",
            FailedPlotNames: "Failed to get plot names !",
            FailedSaplingIds: "Failed to get sapling ids !",
            IncorrectUser: "Incorrect User",
            userNotAuthorized: "user not authorized to access app. contact admin",
            userNotSetup: "user not set up correctly. contact admin",
            deleteImageEdit: "Delete the existing image to add a new image",
            SelectPlot: "Please Select a Plot",
            SelectDifferentPlot: "Please Select different plots",
            NoPlotSelected: "No Plot Selected",
            SamePlotSelected : "Same Plot selected",
            FinishShift: "Do you want to finish the Shift ?", //manjur,
            Synched: "Synched",
            FailedUpdateSapling: "Failed to update sapling: ",
            //editlocaltree
            UnableToFetch: "Unable to fetch data for",
            CorruptedData: "The data for selected sapling seems to be corrupted. Please add it again",
            DeleteTreeData: "Unable to fetch complete data... Please add tree details again !!",
            UnableToFetchHelperData: "Unable to fetch helper data. Please check internet connection...",
            imageAddedAlready: "Image already added for",
            SyncingTrees: 'Syncing Trees',
            SyncingPlotTrees: "Syncing Updated plot trees",
            SyncingImageTrees: "Syncing New image trees",
            MarkedSaplingDead: "You have marked this sapling dead.",
            ConfirmDeleteEntry: "Do you want to delete the entry?",
            EmptyField : "Empty Field!",
            EmptySaplingField : "The sapling field is empty."

        },
        "mr": {
            GPSUnavailable: "त्रुटी: विनंतीची वेळ संपली. GPS सध्या उपलब्ध नाही.",
            gpsActionMessage: "स्थान सेवा आणि/किंवा मोबाइल डेटा चालू करा आणि अॅप रीस्टार्ट करा.",
            //login
            LoginFailed: "लॉग इन अयशस्वी",
            CheckPhoneNumber: "फोन नंबर तपासा.",
            UnknownError: "अज्ञात त्रुटी. एक तज्ञाशी संपर्क साधा.",
            userCancelled: "वापरकर्त्याने लॉगिन प्रवाह रद्द केला.",
            signIninProgress: "ऑपरेशन (उदा. साइन इन) आधीच प्रगतीपथावर आहे.",
            playServicesOutdated: "प्ले सेवा उपलब्ध नाहीत किंवा कालबाह्य आहेत",
            someError: "काही अज्ञात त्रुटी घडली",
            CorrectPhoneNumber: "कृपया 10 अंकी क्रमांक प्रविष्ट करा",
            CorrectPin: "कृपया ४ अंकी पिन नंबर टाका",
            //app
            PermissionsRequired: "परवानगी आवश्यक!",
            Settings: "कृपया सेटिंग्ज वर जाऊन परवानगी द्या",
            //utils
            DataUptodate: "झाडाचे प्रकार आणि प्लॉट अद्याप अपडेट आहेत.",
            DataGettingFetched: "कृपया मदतनीस डेटा प्राप्त होत असताना प्रतीक्षा करा.",
            ShiftDataUptodate: "शिफ्ट्स अद्ययावत आहेत", //manjur
            plotSaplingsDataUpToDate: "प्लॉट रोपटी डेटा अद्ययावत.",
            FailureSavingTrees: "काही झाडाचे प्रकार सेव करण्यात असफल. लॉग पहा.",
            FailureSavingPlots: "काही प्लॉट सेव करण्यात असफल. लॉग पहा.",
            FailureSavingSaplings: "काही रोपे जतन करण्यात अयशस्वी. नोंदी पहा",
            ConfirmActionTitle: "खात्री आहे का?",
            ConfirmActionMsg: "कृपया कृतीची पुष्टी करा.",
            Yes: "होय",
            No: "नाही",
            SyncSuccess: "समक्रमण यशस्वी!",
            SyncFailure: "समक्रमण अयशस्वी!",
            SyncFailureForTrees: "जोडलेल्या झाडांसाठी सिंक अयशस्वी!",
            SyncFailureForImages: "जोडलेल्या प्रतिमांसाठी सिंक अयशस्वी!",
            SyncFailureForShifts: "शिफ्टसाठी सिंक अयशस्वी",
            NothingToSync: "समक्रमित करण्यासाठी झाडे नाहीत! कृपया झाडे जोडा", //manjur
            CheckLocalList: "लोकल झाडांची यादी पहा स्थिती तपासण्यासाठी.",
            ContactExpert: "कृपया एक तज्ञाशी संपर्क साधा.",
            //tree form
            invalidSaplingId: "अवैध रोपटी आयडी",
            alreadyExists: "लोकल डेटामध्ये आधीपासूनच अस्तित्वात आहे.",
            alreadyExistsInDB: "डेटाबेसमध्ये आधीपासूनच अस्तित्वात आहे. नवीन सेपलिंग आयडी एंटर करा.",
            Error: "त्रुटी",
            IncompleteFields: "कृपया सर्व रिक्त जागा भरा.",
            NoImage: "कृपया किमान एक फोटो घ्या.",
            NoTreeLoaction: "कृपया झाड शोधा", //manjur
            selectPlotFirst: "इतर झाडे पाहण्यासाठी प्लॉट निवडा.",
            confirmDeleteImage: "इमेज हटवायची??",
            confirmDeleteSapling: "रोपटे हटवायची?",
            //verify users
            UserVerified: "वापरकर्ता सत्यापित केला गेला",
            doesNotExist: "अस्तित्वात नाही", //manjur
            //localdataview
            NoTreeswithFilter: "दिलेल्या फिल्टरशी झाडे आढळली नाहीत",
            //edit tree
            TreeUpdatedfirsthalf: "झाड : ",
            TreeUpdatedsecondhalf: " अपडेट केले.",
            // DataServive
            FailedAtServer: "सर्व्हरवर विनंती अयशस्वी झाली ",
            RequestToBeSent: "पाठवण्याची विनंती: ",
            //coordinate setter
            LocationError: "तुम्ही फोनवर लोकेशन (GPS) सुरू केली आहे का?",
            //add tree
            TreeSaved: "झाड लोकली सेव्ह केले!",
            //treedb
            FailedGetTreedata: "झाडाचे डेटा मिळविण्यात असफल !",
            FailedGetTreeImgdata: "झाडाचे फोटो मिळविण्यात असफल !",
            FailedTreeCount: "झाडाची संख्या मिळविण्यात असफल !",
            ErrorSetFalse: "अपलोड स्थिती असत्य वर सेट करताना त्रुटी",
            FailedTreeNames: "झाडाचे नाव मिळविण्यात असफल !",
            FailedPlotNames: "प्लॉट नाव मिळविण्यात असफल !",
            FailedSaplingIds: "रोपाची संख्या मिळविण्यात असफल !",
            IncorrectUser: "चुकीचा वापरकर्ता",
            userNotAuthorized: "वापरकर्ता ॲपमध्ये प्रवेश करण्यास अधिकृत नाही. प्रशासकाशी संपर्क साधा",
            userNotSetup: "वापरकर्ता योग्यरित्या सेट नाही. प्रशासकाशी संपर्क साधा",
            deleteImageEdit: "नवीन फोटो जोडण्यासाठी सध्याचा फोटो हटवा",
            SelectPlot: "कृपया एक प्लॉट निवडा",
            SelectDifferentPlot: "कृपया भिन्न भूखंड निवडा", //manjur
            NoPlotSelected: "कोणताही भूखंड निवडलेला नाही",
            SamePlotSelected : "तोच प्लॉट निवडला",
            FinishShift: "तुम्हाला शिफ्ट पूर्ण करायची आहे का ?", //manjur
            Synched: "समक्रमित", //manjur
            FailedUpdateSapling: "रोपे अपडेट करण्यात अयशस्वी", //manjur
            //editlocaltree
            UnableToFetch: "डेटा आणण्यात अयशस्वी",
            CorruptedData: "निवडलेल्या रोपट्याचा डेटा करप्ट झाला आहे. कृपया ते पुन्हा जोडा",
            DeleteTreeData: "संपूर्ण डेटा आणण्यात अक्षम... कृपया वृक्ष तपशील पुन्हा जोडा!!",
            UnableToFetchHelperData: "मदतनीस डेटा आणण्यात अक्षम. कृपया इंटरनेट कनेक्शन तपासा...", //manjur
            imageAddedAlready: "प्रतिमा आधीच जोडली आहे",
            SyncingTrees: 'नवीन झाडे सिंक करणे सुरू',
            SyncingPlotTrees: "अपडेटेड प्लॉट झाडे सिंक करणे सुरू",
            SyncingImageTrees: "नवीन प्रतिमा झाडे सिंक करणे सुरू",
            MarkedSaplingDead: "तुम्ही हे रोपटे मृत मार्क केले आहे",
            ConfirmDeleteEntry: "तुम्हाला एंट्री हटवायची आहे का?",
            EmptyField : "रिकामे फील्ड!",
            EmptySaplingField : "झाडाचे फील्ड रिकामे."
        }
    })
    static buttonLabels = new LocalizedStrings({
        "en": {
            // home
            SyncData: "Sync Data",
            AddNewTree: "Add New Tree",
            AddImage: "Add Tree Image",
            DeadTreeCheck: "Click if the tree is dead",
            UpdateSapling: "Update Saplings",
            StartShift: "Start a Shift",
            Shifts: "Shifts",
            FetchHelperData: "Fetch Helper Data",
            fetchPlotSaplingData: "Fetch Plot-Sapling Data",
            SelectLanguage: "Language/भाषा",

            //shift types
            UploadTree: "Add Sapling",
            UpdatePlot: "Update Tree Plot",
            EnterShiftType: "Select Shift Type",

            // add tree
            ClickPhoto: "Click Photo",
            Submit: "Submit",
            gps: "GPS",
            edit: "Edit",
            drag: "Drag",
            hideAll: "Hide All",
            showAll: "Show All",
            openGallery: "Gallery",
            openCamera: "Camera",
            // local data view
            DeleteSyncedTrees: "Delete Synced Trees",
            Filters: "Filters",
            ClearFilters: "Clear Filters",
            Apply: "Apply",
            //verify users
            Refresh: "Refresh",
            Verify: "Verify",
            //edit tree
            Search: "Search",
            //general:
            save: "Save",
            cancel: "Cancel",
            logOut: 'Log out',
            login: "Log in",
            Done: "End Shift", //manjur
            Continue: "Continue", //manjur
            Settings: "Settings",
            ChangeLanguage: "Change Language",
            ChangeTheme: "Change Theme",

            // Users
            AddUser: "Add User",

            // Visits
            AddVisitImages: 'Add Visit Images',

            // Trees
            TreeImage: 'Tree Image',
            UserTreeImage: 'User Tree Image',
            UserCardImage: 'User Card Image',

            DownloadData: 'Download Data',
            UploadData: 'Upload Data'
        },
        "mr": {
            // home
            SyncData: "सिंक करा",
            AddNewTree: "नवीन झाड जोडा",
            AddImage: "सॅपलिंग इमेज जोडा",
            DeadTreeCheck: "झाड मेले असल्यास क्लिक करा",
            UpdateSapling: "सॅपलिंग अपडेट करा",
            StartShift: "शिफ्ट सुरू करा",
            Shifts: "शिफ्ट",
            FetchHelperData: "मदतकारी डेटा",
            fetchPlotSaplingData: "प्लॉट-सॅपलिंग डेटा मिळवा",
            SelectLanguage: "भाषा/Language",

            //shifttypes
            UploadTree: "वृक्ष अपलोड", //manjur
            //UpdateImage: "प्रतिमा अद्यतनित करा", //manjur
            UpdatePlot: "सॅपलिंग प्लॉट अपडेट",
            EnterShiftType: "शिफ्ट प्रकार प्रविष्ट करा",

            // add tree
            ClickPhoto: "फोटो घ्या",
            Submit: "सबमिट",
            gps: "जीपीएस",
            edit: "सुधारणे",
            drag: "ड्रॅग करा",
            hideAll: "सर्व लपवा",
            showAll: "सगळं दाखवा",
            openGallery: "गॅलरी",
            openCamera: "कॅमेरा",
            // local data view
            DeleteSyncedTrees: "सिंक केलेले झाडे हटवा",
            Filters: "फिल्टर",
            ClearFilters: "फिल्टर काढा",
            Apply: "लागू करा",
            //verify users
            Refresh: "रिफ्रेश करा",
            Verify: "सत्यापित करा",
            //edit tree
            Search: "शोधा",
            //general:
            save: "जतन करा",
            cancel: "रद्द करा",
            logOut: 'बाहेर पडणे',
            login: "लॉगिन",
            Done: "शिफ्ट संपली", //manjur
            Continue: 'सुरू', //manjur
            Settings: "सेटिंग्ज",
            ChangeLanguage: "भाषा बदला",
            ChangeTheme: "थीम बदला",

            // Users
            AddUser: "वापरकर्ता जोडा",

            // Visits
            AddVisitImages: 'भेट प्रतिमा जोडा',

            // Trees
            TreeImage: 'झाडाची प्रतिमा',
            UserTreeImage: 'वापरकर्ता वृक्ष प्रतिमा',
            UserCardImage: 'वापरकर्ता कार्ड प्रतिमा',

            DownloadData: 'डेटा डाउनलोड करा',
            UploadData: 'डेटा अपलोड करा'
        }
    })
    static labels = new LocalizedStrings({
        "en": {

            //add tree
            SaplingId: "Sapling ID",
            SelectTreeType: "Select Plant Type",
            SelectPlot: "Select a Plot",
            SelectedPlot: "Selected Plot",
            SelectTreeStatus: "Select Tree Status",
            SelectUser: "Select User",
            SelectVisit: "Select Visit",
            //local data view
            UploadStatus: "Upload Status",
            TreeType: "Tree Type",
            Plot: "Plot",
            //general
            admin: 'Admin',
            logger: 'Logger',
            //manjur
            Date: 'Date',
            StartTime: 'Start Time',
            EndTime: 'End Time',
            TimeTaken: 'Timer',
            AddAShift : 'Add a tree to this shift',
            Time: 'Time',

            // User
            Username: 'Username',
            Email: 'Email',
            Phone: 'Contact No.',
            DOB: 'Date of Birth',

            // Plot
            PlotName: 'Plot name',
            PlotId: 'Plot ID',
            Tags: 'Tags',
            PlotCategory: 'Plot category',
            Gat: 'Gat',

            // site
            SiteName: 'Site Name',

            // Visits
            VisitName: 'Visit Name',
            VisitType: 'Visit Type',
            VisitDate: 'Visit Date',

            // Trees
            ImageDate: 'Image Date',
        },
        "mr": {
            //add tree
            SaplingId: "रोपाची संख्या",
            SelectTreeType: "झाडाचा प्रकार निवडा",
            SelectPlot: "प्लॉट निवडा",
            SelectedPlot: "निवडलेला प्लॉट",
            SelectTreeStatus: "झाडाची स्थिती निवडा",
            SelectUser: "वापरकर्ता निवडा",
            SelectVisit: "भेट द्या निवडा",
            //local data view
            UploadStatus: "अपलोड स्थिती",
            TreeType: "झाडाचा प्रकार",
            Plot: "प्लॉट",
            admin: 'प्रशासक',
            logger: 'माली',

            //manjur
            Date: 'तारीख',
            StartTime: 'प्रारंभ वेळ',
            EndTime: 'समाप्ती वेळ',
            TimeTaken: 'वेळ',
            Time: 'वेळ',
            AddAShift: 'या शिफ्टमध्ये एक झाड जोडा',

            // User
            Username: 'वापरकर्ता नाव',
            Email: 'ईमेल',
            Phone: 'संपर्क क्र.',
            DOB: 'जन्मतारीख',

            // site
            SiteName: 'साइटचे नाव',

            // Plot
            PlotName: 'प्लॉटचे नाव',
            PlotId: 'प्लॉट आयडी',
            Tags: 'टॅग्ज',
            PlotCategory: 'प्लॉट श्रेणी',
            Gat: 'गॅट',
            AddAShift: 'या शिफ्टमध्ये एक झाड जोडा',

            // Visits
            VisitName: 'भेटीचे नाव',
            VisitType: 'भेट प्रकार',
            VisitDate: 'भेट तारीख',

            // Trees
            ImageDate: 'प्रतिमा/चित्र तारीख',
        }
    })
    static english = 'en';
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
        console.log('language fetched: ', lang);
        return lang;
    }
}