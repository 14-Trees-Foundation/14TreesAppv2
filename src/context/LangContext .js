// LangContext.js
import React, { createContext, useState } from 'react';

const LangContext = createContext();

export const LangProvider = ({ children }) => {
    const [langChanged, setLangChanged] = useState(false);

    return (
        <LangContext.Provider value={{ langChanged, setLangChanged }}>
            {children}
        </LangContext.Provider>
    );
};

export default LangContext;
