import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
import SwitchGrid from './components/SwitchGrid';
import NotificationPanel from './components/NotificationPanel';

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  color: string;
}

function Window() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, color?: string) => {
    setNotifications((prev) => [
      ...prev,
      {
        id: uuidv4(), // simple unique ID
        message,
        timestamp: new Date().toLocaleString('en-GB'),
        color: color || 'white',
      },
    ]);
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((note) => note.id !== id));
  };

  const deleteAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="main-window">
      <SwitchGrid addNotification={addNotification} />
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
