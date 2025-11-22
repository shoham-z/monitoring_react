import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
import SwitchGrid from './components/SwitchGrid';
import NotificationPanel from './components/NotificationPanel';
import { Notification } from '../main/util';

function Window() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const appendNewNotification = (notification: Notification) => {
    window.electron.ipcRenderer.appendNotification(notification);
  };

  const addNotification = (message: string, swId: number, color?: string) => {
    const id = uuidv4();
    const notification = {
      id, // simple unique ID
      message,
      timestamp: new Date().toLocaleString('en-GB'),
      color: color || 'white',
      swId,
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
      <SwitchGrid
        addNotification={addNotification}
        notifications={notifications}
      />
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
