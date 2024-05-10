// LangContext.js
import React, { createContext, useState } from 'react';

const LangContext = createContext();

export const LangProvider = ({ children }) => {
    const [langChanged, setLangChanged] = useState(false);
    const [treesInRealm, setTreesInRealm] = useState([])
    

    return (
        <LangContext.Provider value={{ langChanged, setLangChanged ,treesInRealm, setTreesInRealm}}>
            {children}
        </LangContext.Provider>
    );
};

export default LangContext;
