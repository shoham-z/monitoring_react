import { useState, useEffect, SetStateAction } from "react";

const useAppData = (setAlertTitle: React.Dispatch<SetStateAction<string>>, setAlertMessage: React.Dispatch<SetStateAction<string>>) => {
    const [SERVER_IP, SetServerIp] = useState('');
    const [APP_MODE, SetAppMode] = useState('');
    const [MAX_MISSED_PINGS, setMaxMissedPings] = useState(3);
    const [isReady, setIsReady] = useState(false);


    const initialSetup = async () => {
        window.electron.ipcRenderer.getVars().then(
            (response) =>{
                if (response.success) {
                    let ip = response.content.SERVER_IP || '';
                    SetAppMode(response.content.MODE);
                    setMaxMissedPings(response.content.MAX_MISSED_PINGS || 3);
                    if (!ip.startsWith('http')) {
                    ip = `http://${ip}`;
                    }
                    SetServerIp(ip);
                    setIsReady(true);
                } else {
                    const errorMessage = response.error;
                    setAlertTitle('Error reading vars');
                    setAlertMessage(
                    `${errorMessage}\nPlease Fix or create the file and restart the app.`,
                    );
                }
        })
    }
    useEffect(() => {
        initialSetup();
        const interval = setInterval(() => initialSetup(), 60 * 1000);

        return () => clearInterval(interval);
    }, []);

  return [SERVER_IP, APP_MODE, MAX_MISSED_PINGS, isReady];
};

export default useAppData;