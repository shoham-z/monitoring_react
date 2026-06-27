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

  const getNotificationMessage = (notification: MyNotification) => {
    const message = notification.messageKey
      ? t(notification.messageKey, notification.messageParams || {})
      : notification.message;

    if (typeof message === 'string' && message.includes('<strong>')) {
      return <span dangerouslySetInnerHTML={{ __html: message }} />;
    }

    return <span>{message}</span>;
  };

  return (
    <div className="notification-panel">
      <div className="panel-header">
        <h2>{t('notifications')}</h2>
        <button
          type="button"
          className="clear-btn"
          onClick={deleteAllNotifications}
          title={t('clearAll')}
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
              <td>{getNotificationMessage(notif)}</td>
              <td>{notif.timestamp}</td>
              <td>
                <button
                  type="button"
                  className="read-btn"
                  onClick={() => deleteNotification(notif.id)}
                  title={t('markRead')}
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
