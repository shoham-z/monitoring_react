import '../styles/NotificationPanel.css';
import { FaCheck } from 'react-icons/fa';
import { MdDeleteSweep } from 'react-icons/md';

function NotificationPanel(props: {
  notifications: { id: string; message: string; timestamp: string }[];
  deleteNotification: (id: string) => void;
  deleteAllNotifications: () => void;
}) {
  const { notifications, deleteNotification, deleteAllNotifications } = props;

  return (
    <div className="notification-panel">
      <div className="panel-header">
        <h2>Notifications</h2>
        <button
          type="button"
          className="clear-btn"
          onClick={deleteAllNotifications}
          title="Clear All"
        >
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
              <td>{notif.timestamp}</td>
              <td>
                <button
                  type="button"
                  className="read-btn"
                  onClick={() => deleteNotification(notif.id)}
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
}

export default NotificationPanel;
