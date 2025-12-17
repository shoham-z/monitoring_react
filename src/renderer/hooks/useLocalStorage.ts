import { useState } from "react";
import { errorFormat, PingableEntry } from "../utils";

export interface localStorageLoadValues {
    success: boolean;
    data: any;
}

export interface LocalStorageValues  {
    itemList: any;
    loadData: () => Promise<localStorageLoadValues>;
    saveData: (arg0: Array<PingableEntry>) => Promise<void>;
    error: errorFormat | null;
}

const useLocalStorage: () => LocalStorageValues = () => {
    const [error, setError] = useState<errorFormat | null>(null);
    const [itemList, setItemList] = useState<any>([]);

    // loads items from local file
    const loadData = async () => {
        try {
            const result = await window.electron.ipcRenderer.loadItemList();
            if (result.success && result.content && result.content.length > 0) {
                setItemList(result.content);
                return {success: true, data: result.content};
            }
            return {success: false, data: null};
        } catch (error) {
            setError({title: 'Failed to load item list:', message: String(error)})
            return {success: false, data: null};
        }
    };
    
    // saves items to local file
    const saveData = async (items: Array<PingableEntry>) => {
        // TODO: handle errors here
        try {
        const result = await window.electron.ipcRenderer.saveItemList(items);
        if (!result.success) {
            setError({title: 'Failed to save item list:', message: result.error})
            console.error('Failed to save item list:', result.error);
        } else {
            console.log('Saved Item list to local storage');
        }
        } catch (error) {
            setError({title: 'Failed to save item list:', message: String(error)})
            console.error('Error saving to local storage:', error);
        }
    };

    return { itemList, loadData, saveData, error };
};

export default useLocalStorage;