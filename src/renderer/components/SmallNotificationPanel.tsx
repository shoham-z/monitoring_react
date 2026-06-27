import '../styles/SmallNotificationPanel.css';
import { useTranslation } from 'react-i18next';
import { MyNotification } from '../../main/util';

function SmallNotificationPanel(props: { notifications: MyNotification[] }) {
  const { notifications } = props;

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
    <div className="small-notification-panel">
      <div className="small-panel-header">
        <h2>{t('notifications')}</h2>
      </div>
      <table className="small-notification-table">
        <thead>
          <tr>
            <th>{t('notificationMessage')}</th>
            <th>{t('notificationTime')}</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notif) => (
            <tr key={notif.id} className={`tr-${notif.color}`}>
              <td>{getNotificationMessage(notif)}</td>
              <td>{notif.timestamp}</td>
            </tr>
          ))}
          {notifications.length === 0 && (
            <tr>
              <td colSpan={2} className="small-no-notifications">
                {t('notificationEmpty')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SmallNotificationPanel;
