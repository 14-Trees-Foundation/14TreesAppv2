
import {useApp, useUser} from '@realm/react';
import {ActivityIndicator, SafeAreaView} from 'react-native';
import {OpenRealmBehaviorType, } from 'realm';
import App from './App';
import {useEffect, useState, useRef,useContext} from 'react';
import {RealmContext,trees,tree_types,plots} from './models/Tree';
import Realm from "realm";
const {RealmProvider} = RealmContext;


function RealmWrapper(): JSX.Element {
  const app = useApp(); //using for Login
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  

  useEffect(() => {   
    const login = async () => {
      const credentials = Realm.Credentials.anonymous(); //using anonymous login credentials
      await app.logIn(credentials);
      setIsLoggedIn(true);
    };
    login();
  }, [app]);


  
  return(

    <SafeAreaView style={{flex: 1}}>
      {isLoggedIn ? (
        <RealmProvider closeOnUnmount={false}
          sync={{
            flexible: true,
            // initialSubscriptions: {
            //   update(subs, realm) {
            //     subs.add(realm.objects('trees')),
            //     subs.add(realm.objects('plots')),
            //     subs.add(realm.objects('tree_types'))
            //   },
            // },
            newRealmFileBehavior: {
              type: OpenRealmBehaviorType.DownloadBeforeOpen,
            },
            existingRealmFileBehavior: {
              type: OpenRealmBehaviorType.OpenImmediately,
            },
          }}
          //realmRef={realmRef}
          >
          <App />
        </RealmProvider>
      ) : (
        <ActivityIndicator size={'large'} />
      )}
    </SafeAreaView>
  );
}

export default RealmWrapper;