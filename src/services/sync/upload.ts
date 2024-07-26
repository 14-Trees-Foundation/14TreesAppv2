import React from "react";
import { Utils } from "../Utils";
import { uploadTreesData } from "./tree"
import { uploadVisitImagesData } from "./visit_images";

export const uploadLocalData = async (setProgress: React.Dispatch<React.SetStateAction<number>>) => {
    
    try {
        await uploadTreesData();
    } catch (error: any) {
        const stackTrace = error.stack;
        const errorLog = {
            msg: 'Error uploading local trees data',
            error: JSON.stringify(error),
            stackTrace: stackTrace,
        };
        await Utils.logException(JSON.stringify(errorLog));
    }
    setProgress(prev => { return prev + 0.2 > 1 ? 1 : prev + 0.2 });

    try {
        await uploadVisitImagesData();
    } catch (error: any) {
        const stackTrace = error.stack;
        const errorLog = {
            msg: 'Error uploading local visit images',
            error: JSON.stringify(error),
            stackTrace: stackTrace,
        };
        await Utils.logException(JSON.stringify(errorLog));
    }
    setProgress(prev => { return prev + 0.2 > 1 ? 1 : prev + 0.2 });
}