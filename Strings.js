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
            AddTree:"झाड जोडा",
            localDataView:"लोकल डेटा",
            VerifyUsers:"वापरकर्ते सत्यापित करा",
            EditTree:"झाड संपादित करा",
            LogIn:'Log In',//TODO, need to resolve a bug here, do NOT add translation yet.
        }
    })

    // text strings
    static languages = new LocalizedStrings({
        "en": {
            LogIn:"Login",
            SignIn:"Sign In",
            // home
            Never:"Never",
            LastSyncDataOn:"Last Sync Data On : ",
            // add tree
            Location:"Location",   
            CapturedAt:"Captured At",
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
            LastSyncDataOn:"शेवटचा सिंक केलेला डेटा : ",
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