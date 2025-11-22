import '../styles/SmallNotificationPanel.css';
import { MyNotification } from '../../main/util';

function SmallNotificationPanel(props: { notifications: MyNotification[] }) {
  const { notifications } = props;

  return (
    <div className="small-notification-panel">
      <div className="small-panel-header">
        <h2>Notifications</h2>
      </div>
      <table className="small-notification-table">
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
              <td colSpan={2} className="small-no-notifications">
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
