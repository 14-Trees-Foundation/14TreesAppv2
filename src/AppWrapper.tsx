import { AppProvider, UserProvider } from "@realm/react";
import React, { useRef } from "react";
import RealmWrapper from "./RealmWrapper";


function AppWrapper(): JSX.Element {
    
    
    return (
        <AppProvider id={'application-0-rqsky'} >
            <UserProvider fallback={<RealmWrapper />}>
                <RealmWrapper />
            </UserProvider>
        </AppProvider>
    );
}

export default AppWrapper;