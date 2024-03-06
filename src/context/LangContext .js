// LangContext.js
import React, { createContext, useState } from 'react';

const LangContext = createContext();

export const LangProvider = ({ children }) => {
    const [langChanged, setLangChanged] = useState(false);
    const [shifts, setShifts] = useState(0); //in db it will go

    return (
        <LangContext.Provider value={{ langChanged, setLangChanged, shifts, setShifts }}>
            {children}
        </LangContext.Provider>
    );
};

export default LangContext;
