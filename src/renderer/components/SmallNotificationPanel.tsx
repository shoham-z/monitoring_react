import '../styles/NotificationPanel.css';
import { Notification } from '../../main/util';

function SmallNotificationPanel(props: {
  notifications: Notification[];
}) {
  const { notifications } = props;

  return (
    <div className="notification-panel">
      <div className="panel-header">
        <h2>Notifications</h2>
      </div>
      <table className="notification-table">
        <thead>
          <tr>
            <th>Message</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notif) => (
            <tr key={notif.id} className={`tr-${notif.color}`}>
              <td>{notif.message}</td>
              <td>{notif.timestamp}</td>
            </tr>
          ))}
          {notifications.length === 0 && (
            <tr>
              <td colSpan={2} className="no-notifications">
                No notifications
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SmallNotificationPanel;
