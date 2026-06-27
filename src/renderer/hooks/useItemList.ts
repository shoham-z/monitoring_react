import { useState, useEffect, useRef, SetStateAction } from "react";
import { useTranslation } from 'react-i18next';
import { errorFormat, PingableEntry, ReachableEntry } from "../utils";
import { AppDataValues } from "./useAppData";
import useLocalStorage from "./useLocalStorage";
import type { localStorageLoadValues, LocalStorageValues } from "./useLocalStorage";
import useServerActions, { ServerActionsValues } from "./useServerActions";

export interface ItemListValues {
    list: Array<PingableEntry>;
    reachabilityList: Array<ReachableEntry>;
    updateReachability: (ip: string, pingSuccess: boolean) => ReachabilityEvent;
    reachabilityEvents: ReachabilityEvent[];
    clearReachabilityEvents: () => void;
    isServerOnline: boolean;
    selecteditemIP: string;
    addItem: (ip: string, hostname: string, location: string) => void;
    editItem: (index: string, newIp: string, hostname: string, location: string) => void;
    deleteItem: (ip: string) => Promise<boolean>;
    handleSelect: (ip: SetStateAction<string>) => void
    error: errorFormat | null;
}

export type ReachabilityEvent = {
  id: number;
  status: 'UP' | 'DOWN';
};

enum ItemAction{
    ADD, EDIT, DELETE, LOAD
}

const actionVerbKey: Record<ItemAction, string> = {
    [ItemAction.ADD]: 'actionVerbAdd',
    [ItemAction.EDIT]: 'actionVerbEdit',
    [ItemAction.DELETE]: 'actionVerbDelete',
    [ItemAction.LOAD]: 'actionVerbLoad',
}

const failedActionTitleKey: Record<ItemAction, string> = {
    [ItemAction.ADD]: 'failedToAddDevice',
    [ItemAction.EDIT]: 'failedToEditDevice',
    [ItemAction.DELETE]: 'failedToDeleteDevice',
    [ItemAction.LOAD]: 'failedToLoadDevices',
}

const useItemList: (arg0: AppDataValues) => ItemListValues
= (appData: AppDataValues) => {
    const { t } = useTranslation();
    const [list, setItemList] = useState<Array<PingableEntry>>([]);
    const [reachabilityList, setReachabilityList] = useState<Array<ReachableEntry>>([]);
    const [isServerOnline, setIsServerOnline] = useState(false);
    const localStorage: LocalStorageValues = useLocalStorage();
    const [selectedIp, setSelectedIp] = useState('');
    const lastReachableRef = useRef<Record<number, boolean | undefined>>({});
    const missedPingsRef = useRef<Record<string, number>>({});
    const [reachabilityEvents, setReachabilityEvents] = useState<ReachabilityEvent[]>([]);
    const serverActions: ServerActionsValues = useServerActions(appData.serverIp);
    const [error, setError] = useState<errorFormat | null>(null);
    const serverDownCounterRef = useRef(10); // 5 minutes


    const clearReachabilityEvents = () => {
        setReachabilityEvents([]);
    };

    const loadFromLocalStorageHelper = async () => {
        const { success, data }: localStorageLoadValues =
          await localStorage.loadData();
        if (success) {
          // Instead save the data
          setItemList(data);

          setReachabilityList((prev) => {
            if (prev.length === 0) {
              return data.map((item: PingableEntry) => ({
                id: item.id,
                missedPings: 0,
              }));
            }
            return prev;
          });
        } else if (localStorage.error) {
          setError({title: localStorage.error.title, message: localStorage.error.message});
        } else {
          setError({title:
            t('unexpectedError'),
            message: t('unexpectedErrorMessage'),
        });
        }
    };

    const setFailedActionError = (action: ItemAction, message: string) => {
        setError({ title: t(failedActionTitleKey[action]), message });
    }

    const setItemActionFailedError = (action: ItemAction) => {
        setError({
            title: t('serverOffline'),
            message: t('cannotActionWhileOffline', { action: t(actionVerbKey[action]) }),
        });
    }

    const setConnectionError = () => {
        const count = serverDownCounterRef.current;
        if(count !== 10){
            serverDownCounterRef.current += 1;
            return;
        }

        serverDownCounterRef.current = 0;
        setError({
            title: t('connectionError'),
            message: t('connectionErrorMessage'),
        });
    }

    // used to handle the chosen item when pressed
    const handleSelect = (ip: string | SetStateAction<string>) => {
        setSelectedIp((prev) => {
        if (typeof ip === 'function') {
            // preserve ability to pass updater functions
            return (ip as any)(prev);
        }
        return prev === ip ? '' : ip;
        });
    };

    // used to update visibility in list
    const updateReachability = (ip: string, pingSuccess: boolean): ReachabilityEvent => {
        let data: {id: number, status: 'UP' | 'DOWN'} = { id: -1, status: 'DOWN'};


        const item = list.find((sw) => sw.ip === ip);
        if (!item) return data;

        const { id } = item;

        const prevMissed = missedPingsRef.current[id] ?? 0;
        const newMissed = pingSuccess ? 0 : prevMissed + 1;
        missedPingsRef.current[id] = newMissed;

        const isReachable = newMissed < appData.maxMissedPings;
        const wasReachable = lastReachableRef.current[id];

        // --- update UI reachability ---
        setReachabilityList((prev) => {
            const found = prev.some((r) => r.id === id);
            const updated = prev.map((r) =>
            r.id === id ? { ...r, missedPings: newMissed } : r
            );
            return found ? updated : [...updated, { id, missedPings: newMissed }];
        });


        // --- notification rules ---
        if (wasReachable === undefined) {
            if (!isReachable) {
                data = { id, status: 'DOWN' };
                lastReachableRef.current[id] = false;
            }
        } else if (wasReachable && !isReachable) {
            lastReachableRef.current[id] = false;
            data = { id, status: 'DOWN' };
        } else if (!wasReachable && isReachable) {
            lastReachableRef.current[id] = true;
            data = { id, status: 'UP' };
        }

        return data;
    };


    // used to fetch new items from server
    const fetchFromServer = async (): Promise<void> => {
        const NOTIFICATION_TITLE = 'Basic Notification';
        const NOTIFICATION_BODY = 'Notification from the Main process';

        // window.electron.ipcRenderer.showNotification(
        //   NOTIFICATION_TITLE,
        //   NOTIFICATION_BODY,
        // );


        const onSuccess = (response: { status?: any; data?: any; }) => {
        if (response.status !== 200) return;
            const { data } = response;

            // Set Item list
            setItemList(data);

            // Save to local storage for offline use
            localStorage.saveData(data);

            // Mark server as online
            setIsServerOnline(true);

            setReachabilityList((prev) => {
                if (prev.length === 0) {
                return data.map((item: PingableEntry) => ({
                    id: item.id,
                    missedPings: 0,
                }));
                }
                return prev;
            });
        }

        const onFail = (error: { response: { data?: any; status?: any; }; }) => {
            // Mark server as offline
            setIsServerOnline(false);

            // Try to load from local storage as fallback
            loadFromLocalStorageHelper();

            // Only show error if we couldn't load from cache either
            if (error.response) {
                const { status } = error.response;
                const errorMsg = error.response.data?.error || '';
                const humanReadable = getHumanReadableError(status, errorMsg);
                setFailedActionError(ItemAction.LOAD, humanReadable);
            } else {
               setConnectionError();
            }
        };

       serverActions.get(`api/getAll`, onSuccess, onFail);
    };

    // Load from local storage on startup
    useEffect(() => {
        if (!appData.isReady) return;

        // Try to load from local storage first for immediate display
        loadFromLocalStorageHelper();

        // Then try to fetch from server (will update if successful)
        fetchFromServer();
        const interval = setInterval(() => fetchFromServer(), 30000);

        return () => {
        clearInterval(interval);
        };
    }, [appData.isReady]);

    // Helper function to convert server error responses to human-readable messages
    const getHumanReadableError: (arg0: number, arg1?: string) => string = (
        status: number,
        errorMessage?: string,
    ): string => {
        switch (status) {
        case 400:
            if (errorMessage?.includes('Missing required fields')) {
            return t('errorMissingFields');
            }
            if (errorMessage?.includes('Invalid IPv4 address')) {
            return t('errorInvalidIPv4');
            }
            if (errorMessage?.includes('Name cannot be empty')) {
            return t('errorEmptyName');
            }
            return t('errorInvalidInput');
        case 404:
            return t('errorDeviceNotFound');
        case 409:
            if (errorMessage?.includes('UNIQUE constraint')) {
            return t('errorDuplicateIP');
            }
            return t('errorConflict');
        case 500:
            return t('errorServerUnexpected');
        default:
            if (errorMessage) {
            return errorMessage;
            }
            return t('errorUnexpected');
        }
    };

    // used to add item to list and send to server
    const addItem = (ip: string, hostname: string, location: string): void => {
        if (!isServerOnline) {
            setItemActionFailedError(ItemAction.ADD);
            return;
        }

        const data = { ip, name: hostname, location };

        const headers = { headers: { 'Content-Type': 'application/json' } };

        const onSuccess = (response: { status: number; }) => {
            if (response.status !== 201)
                return;
            // Mark server as online
            setIsServerOnline(true);
            // Only update UI if server successfully added the device
            const getMaxId = (list: any[]) => {
                return Math.max(...list.map((item) => item.id), 0);
            };
            const newId = getMaxId(list) + 1;
            const newItem = {
                id: newId,
                ip,
                name: hostname,
                location,
            };
            const updatedList = [...list, newItem];
            setItemList(updatedList);
            // Save to local storage
            localStorage.saveData(updatedList);
        };

        const onFail = (error: { response: { data?: any; status?: any; }; }) => {
            // Mark server as offline on connection error
            if (error.response) {
            const { status } = error.response;
            const errorMsg = error.response.data?.error || '';
            const humanReadable = getHumanReadableError(status, errorMsg);
            setFailedActionError(ItemAction.ADD, humanReadable);
            } else {
            setIsServerOnline(false);
            setConnectionError();
            }
        };

        serverActions.post(`api/add`, data, headers, onSuccess, onFail);
    };

    // used to edit item in list and send to server
    const editItem = (index: string, newIp: string, hostname: string, newLocation: string): void => {
        if (!isServerOnline) {
            setItemActionFailedError(ItemAction.EDIT);
            return;
        }

        const numericId = Number(index);
        const previousIp = list.find((item) => item.id === numericId)?.ip;

        const data = { id: index, ip: newIp, name: hostname, location: newLocation };

        const onSuccess = (response: { status: number; }) => {
            if (response.status !== 200)
                return;
            // Mark server as online
            setIsServerOnline(true);
            // Only update UI if server successfully edited the device
            setItemList((prevList) => {
                const updatedList = prevList.map((item) =>
                item.id === numericId
                    ? { ...item, name: hostname, ip: newIp, location: newLocation }
                    : item,
                );
                // Save to local storage
                localStorage.saveData(updatedList);
                return updatedList;
            });

            if (previousIp && selectedIp === previousIp) {
                setSelectedIp(newIp);
            }
        };

        const onFail = (error: { response: { data?: any; status?: any; }; }) => {
            // Mark server as offline on connection error
            if (error.response) {
                const { status } = error.response;
                const errorMsg = error.response.data?.error || '';
                const humanReadable = getHumanReadableError(status, errorMsg);
                setFailedActionError(ItemAction.EDIT, humanReadable);
            } else {
                setIsServerOnline(false);
                setConnectionError();
            }
        };

        serverActions.put(`api/edit`, data, onSuccess, onFail);
    };

    // used to delete item and update server
    const deleteItem = async (ip: string): Promise<boolean> => {
        if (!isServerOnline) {
            setItemActionFailedError(ItemAction.DELETE);
            return false;
        }

        const data = { data: { ip } };

        const onSuccess = (response: { status: number; }) => {
            if (response.status !== 200) return false;
            // Mark server as online
            setIsServerOnline(true);
            // Only update UI if server successfully deleted the device
            const updatedList = list.filter((item) => {
                return item.ip !== ip ? item : null;
            });
            setItemList(updatedList);
            // Save to local storage
            localStorage.saveData(updatedList);
            return true;
        };

        const onFail = (error: { response: { data?: any; status?: any; }; }) => {
            // Mark server as offline on connection error
            if (error.response) {
            const { status } = error.response;
            const errorMsg = error.response.data?.error || '';
            const humanReadable = getHumanReadableError(status, errorMsg);
            setFailedActionError(ItemAction.DELETE, humanReadable);
            return false;
            } else {
            setIsServerOnline(false);
            setConnectionError();
            return false;
            }
        };

        return await serverActions.remove(`api/delete`, data, onSuccess, onFail);

     };

    return {
        list,
        reachabilityList,
        updateReachability,
        reachabilityEvents,
        clearReachabilityEvents,
        isServerOnline,
        selecteditemIP: selectedIp,
        addItem,
        editItem,
        deleteItem,
        handleSelect,
        error,
    };
};

export default useItemList;


