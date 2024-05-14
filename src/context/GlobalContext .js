// GlobalContext.js
import React, { createContext, useState } from 'react';

const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
    const [langChanged, setLangChanged] = useState(false);
    const [userName, setUserName] = useState("");
    const [lightTheme, setLightTheme] = useState(false);
    const [shiftDone, setShiftDone] = useState(true);

    const [shiftID, setShiftID] = useState(null);
    const [treesPlanted, setTreesPlanted] = useState(0);
    const [shiftTime, setShiftTime] = useState(null);
    const [plotSelected, setPlotSelected] = useState(null);
    const [playSound, setPlaySound] = useState(false);

    return (
        <GlobalContext.Provider value={{
            langChanged, setLangChanged,
            shiftDone, setShiftDone,
            userName, setUserName,
            treesPlanted, setTreesPlanted,
            lightTheme, setLightTheme,
            shiftTime, setShiftTime,
            plotSelected, setPlotSelected,
            shiftID, setShiftID,
            playSound, setPlaySound
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export default GlobalContext;
