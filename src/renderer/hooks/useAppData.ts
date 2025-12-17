import { useState, useEffect, useCallback } from "react";
import { errorFormat } from "../utils";

export interface AppDataValues {
  serverIp: string;
  appMode: string;
  maxMissedPings: number;
  isReady: boolean;
  error: errorFormat | null;
}

const useAppData: () => AppDataValues = () => {
    const [serverIp, setServerIp] = useState('');
    const [appMode, setAppMode] = useState('');
    const [maxMissedPings, setMaxMissedPings] = useState(3);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<errorFormat | null>(null);

    const initialSetup = useCallback(async () => {
        try {
            const response = await window.electron.ipcRenderer.getVars()
        
            if (!response.success) {
                const errorMessage = response.error;
                setError({
                    title: 'Error reading vars',
                    message: `${errorMessage}\nPlease Fix or create the file and restart the app.`
                })
                return;
            }
            setError(null);
            let ip = response.content.SERVER_IP || '';
            setAppMode(response.content.MODE);
            setMaxMissedPings(response.content.MAX_MISSED_PINGS || 3);
            if (!ip.startsWith('http')) {
            ip = `http://${ip}`;
            }
            setServerIp(ip);
            setIsReady(true);

        } catch (err) {
            setError({
                        title: 'Unexpected error',
                        message: String(err)
                    })
        }
    }, []);

    useEffect(() => {
        initialSetup();
        const interval = setInterval(() => initialSetup(), 60 * 1000);

        return () => clearInterval(interval);
    }, [initialSetup]);

  return {
    serverIp,
    appMode,
    maxMissedPings,
    isReady,
    error
};
};

export default useAppData;
