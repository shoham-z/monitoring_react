import { useState, useEffect, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { errorFormat } from "../utils";

export interface AppDataValues {
  serverIp: string;
  appMode: string;
  maxMissedPings: number;
  network: string;
  isReady: boolean;
  error: errorFormat | null;
}

const useAppData: () => AppDataValues = () => {
    const [serverIp, setServerIp] = useState('');
    const [appMode, setAppMode] = useState('');
    const [maxMissedPings, setMaxMissedPings] = useState(3);
    const [network, setNetwork] = useState('');
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<errorFormat | null>(null);
    const { t } = useTranslation();

    const translateVarsError = useCallback((errorCode: string): string => {
        const key = `varsErrors.${errorCode}`;
        return t(key, { defaultValue: errorCode });
    }, [t]);

    const initialSetup = useCallback(async () => {
        try {
            const response = await window.electron.ipcRenderer.getVars()

            if (!response.success) {
                const errorMessage = translateVarsError(response.error);
                setError({
                    title: t('errorVars'),
                    message: t('fixVars', { errorMessage })
                })
                return;
            }
            setError(null);
            let ip = response.content.SERVER_IP || '';
            setAppMode(response.content.MODE);
            setMaxMissedPings(response.content.MAX_MISSED_PINGS || 3);
            setNetwork(response.content.NETWORK || '');
            if (!ip.startsWith('http')) {
            ip = `http://${ip}`;
            }
            setServerIp(ip);
            setIsReady(true);

        } catch (err) {
            setError({title: t('unexpectedError') ,message: String(err)})
        }
    }, [t, translateVarsError]);

    useEffect(() => {
        initialSetup();
        const interval = setInterval(() => initialSetup(), 60 * 1000);

        return () => clearInterval(interval);
    }, [initialSetup]);

  return {
    serverIp,
    appMode,
    maxMissedPings,
    network,
    isReady,
    error
};
};

export default useAppData;
