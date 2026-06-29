import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Grid from './components/Grid';
import NotificationPanel from './components/NotificationPanel';
import { MyNotification } from '../main/util';
import '../i18n/config';

function Window() {
  const [notifications, setNotifications] = useState<MyNotification[]>([]);
  const { i18n } = useTranslation();

  useEffect(() => {
    const removeListener = window.electron.ipcRenderer.onChangeLanguage(
      (lng) => {
        i18n.changeLanguage(lng);
        document.documentElement.dir = lng === 'he' ? 'rtl' : 'ltr';
      },
    );
    return () => removeListener();
  }, [i18n]);

  const appendNewNotification = (notification: MyNotification) => {
    window.electron.ipcRenderer.appendNotification(notification);
  };

  const addNotification = (
    swId: number,
    color?: string,
    name?: string,
    ip?: string,
    messageKey?: string,
    messageParams?: Record<string, string | number>,
  ) => {
    const id = uuidv4();
    const notification: MyNotification = {
      id,
      timestamp: new Date().toLocaleString('en-GB'),
      color: color || 'white',
      swId,
      name,
      ip,
      messageKey,
      messageParams,
    };
    appendNewNotification(notification);
    setNotifications((prev) => [...prev, notification]);
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((note) => note.id !== id));
  };

  const deleteAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="main-window">
      <Grid addNotification={addNotification} notifications={notifications} />
      <NotificationPanel
        notifications={notifications}
        deleteNotification={deleteNotification}
        deleteAllNotifications={deleteAllNotifications}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Window />} />
      </Routes>
    </Router>
  );
}
