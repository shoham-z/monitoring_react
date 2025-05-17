import React, { useState } from 'react';
import '../styles/NotificationPanel.css';
import { FaCheck } from 'react-icons/fa';
import { MdDeleteSweep } from 'react-icons/md';

interface Notification {
  id: number;
  message: string;
  time: string;
}

function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: 'Switch 192.168.0.1 is unreachable', time: '10:34 AM' },
    { id: 2, message: 'Switch 192.168.0.10 is back online', time: '10:50 AM' },
    { id: 3, message: 'New switch connected: 192.168.0.22', time: '11:05 AM' },
  ]);

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="notification-panel">
      <div className="panel-header">
        <h2>Notifications</h2>
        <button className="clear-btn" onClick={clearAll} title="Clear All">
          <MdDeleteSweep size={18} />
        </button>
      </div>
      <table className="notification-table">
        <thead>
          <tr>
            <th>Message</th>
            <th>Time</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notif) => (
            <tr key={notif.id}>
              <td>{notif.message}</td>
              <td>{notif.time}</td>
              <td>
                <button
                  className="read-btn"
                  onClick={() => markAsRead(notif.id)}
                  title="Mark as read"
                >
                  <FaCheck />
                </button>
              </td>
            </tr>
          ))}
          {notifications.length === 0 && (
            <tr>
              <td colSpan={3} className="no-notifications">
                No notifications
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default NotificationPanel;
