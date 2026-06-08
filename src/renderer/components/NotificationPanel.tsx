import '../styles/NotificationPanel.css';
import { FaCheck } from 'react-icons/fa';
import { MdDeleteSweep } from 'react-icons/md';
import { useTranslation } from 'react-i18next';

import { MyNotification } from '../../main/util';

function NotificationPanel(props: {
  notifications: MyNotification[];
  deleteNotification: (id: string) => void;
  deleteAllNotifications: () => void;
}) {
  const { notifications, deleteNotification, deleteAllNotifications } = props;

  const { t } = useTranslation();

  return (
    <div className="notification-panel">
      <div className="panel-header">
        <h2>{t('notifications')}</h2>
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
            <th>{t('notificationMessage')}</th>
            <th>{t('notificationTime')}</th>
            <th>{t('notificationAction')}</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notif) => (
            <tr key={notif.id} className={`tr-${notif.color}`}>
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
                {t('notificationEmpty')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default NotificationPanel;
