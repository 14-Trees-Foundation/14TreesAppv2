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
        },
        "mr":{

            HomePage:"मुख्य पृष्ठ",
            AddTree:"Add Tree (MR)",
            localDataView:"Local Data (MR)",
            VerifyUsers:"Verify Users (MR)",
            EditTree:"Edit Tree (MR)",
            LogIn:'Log In',//TODO, need to resolve a bug here, do NOT add translation yet.
        }
    })
    static languages = new LocalizedStrings({
        "en": {
            LogIn:"Login",
            SignIn:"Sign In",
            // home
            Never:"Never",
            LastSyncDataOn:"Last Sync Data On : ",
            SyncData:"Sync Data",
            AddNewTree:"Add New Tree",
            FetchHelperData:"Fetch Helper Data",
            SelectLanguage:"Select Language",
            // add tree
            SaplingId:"Sapling Id",
            SelectTreeType:"Select Tree Type",
            SelectPlot:"Select Plot",
            Location:"Location",
            ClickPhoto:"Click Photo",
            Submit:"Submit",
            CapturedAt:"Captured At",
            // local data view
            NoTreesFound:"No Trees Found on phone",
            DeleteSyncedTrees:"Delete Synced Trees",
            Filters:"Filters",
            ClearFilters:"Clear Filters",
            UploadStatus:"Upload Status",
            TreeType: "Tree Type",
            Plot: "Plot",
            Apply:"Apply",
            LoadingTrees:"Loading Trees...",
            SaplingNo:"Sapling ID: ",
            TypeId : "Type ID: ",
            PlotId : "Plot ID: ",
            Synced:"Synced",
            Local:"Local",
            NoImageFound:"No Image Found",
            //verify users
            ListUnverifiedUsers:"List of Unverified Users",
            Refresh:"Refresh",
            Name:"Name: ",
            Email:"Email: ",
            Verify:"Verify",
            //Edit tree
            EnterSaplingId:" Enter the Sapling ID",
            Search:"Search",
        },
        "mr": {
            SignIn:"साइन इन करा",
            // home
            LogIn:"लॉग इन",
            Never:"कधीच नाही",
            LastSyncDataOn:"शेवटचा सिंक केलेला डेटा : ",
            SyncData:"डेटा सिंक करा",
            AddNewTree:"नवीन झाड जोडा",
            FetchHelperData:"मदतकारी डेटा तयार करा",
            SelectLanguage:"भाषा निवडा",
            // add tree
            SaplingId:"रोपांची संख्या ",
            SelectTreeType:"झाडाचा प्रकार निवडा",
            SelectPlot:"भूमि निवडा",
            Location:"स्थान",
            ClickPhoto:"फोटो घ्या",
            Submit:"सबमिट करा",
            CapturedAt:"फोटो घेतले तारीख",
            // local data view
            NoTreesFound:"फोनवर झाडे आढळली नाहीत",
            DeleteSyncedTrees:"सिंक केलेले झाडे हटवा",
            Filters:"फिल्टर",
            ClearFilters:"फिल्टर काढा",
            UploadStatus:"अपलोड स्थिती",
            TreeType: "झाडाचा प्रकार",
            Plot: "प्लॉटचे नाव ",
            Apply:"लागू करा",
            LoadingTrees:"झाडे लोड होत आहेत...",
            SaplingNo:"रोप क्र: ",
            TypeId : "प्रकार क्र: ",
            PlotId : "प्लॉट क्र: ",
            Synced:"सिंक केले गेले",
            Local:"लोकल",
            NoImageFound:"फोटो नाही",
            //verify users
            ListUnverifiedUsers:"असत्यापित वापरकर्त्यांची यादी",
            Refresh:"रिफ्रेश करा",
            Name:"नाव : ",
            Email:"ईमेल : ",
            Verify:"सत्यापित करा",
            //Edit tree
            EnterSaplingId:"रोपाची संख्या लिहा",
            Search:"शोधा",
        },
    });
    static buttonLabels = new LocalizedStrings({
        "en":{

        },
        "mr":{

        }
    })
    static labels = new LocalizedStrings({
        "en":{

        },
        "mr":{

        }
    })
    static english  = 'en';
    static marathi = 'mr';
    static setLanguage = async (langidx) => {
        var lang = langidx;
        await AsyncStorage.setItem(Constants.selectedLangKey, lang);
        this.languages.setLanguage(lang);
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