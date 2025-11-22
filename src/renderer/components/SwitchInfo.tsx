import { useEffect, useState } from 'react';
import { Buffer } from 'buffer';
import '../styles/AlertDialog.css';
import { MyNotification } from '../../main/util';
import SmallNotificationPanel from './SmallNotificationPanel';

function SwitchInfo(props: {
  isOpen: boolean;
  setIsOpen: any;
  title: string;
  message: string;
  onDelete: any;
  switchId: number;
}) {
  const { isOpen, setIsOpen, title, message, onDelete, switchId } = props;

  const [notifications, setNotifications] = useState<MyNotification[]>([]);
  useEffect(() => {
    window.electron.ipcRenderer
      .readNotifications()
      .then((response) => {
        if (response.success) {
          const newNotifications = response.content as MyNotification[];
          const filteredNotifications = newNotifications.filter(
            (n) => n.swId === switchId,
          );
          setNotifications(filteredNotifications);
          return true;
        }
        setNotifications([]);
        return false;
      })
      .catch(() => {
        setNotifications([]);
      });
  }, [switchId]);

  const handleClose = () => {
    setIsOpen(false);
    onDelete();
  };

  // Split the message by newlines and map each part to a <p> element
  const messageLines = message.split('\n').map((line, index) => {
    const key = `${index}-${Buffer.from(line).toString('base64')}`;
    return (
      <p key={key} className="mui-dialog-text">
        {line}
      </p>
    );
  });

  return (
    isOpen && (
      <div className="mui-dialog-backdrop">
        <div className="mui-dialog">
          <div className="mui-dialog-container">
            <button
              className="mui-dialog-close"
              type="button"
              onClick={handleClose}
            >
              &times;
            </button>

            <div className="mui-dialog-title" id="alert-dialog-title">
              {title}
            </div>

            <div className="mui-dialog-content">
              {/* Render each line of the message */}
              {messageLines}
            </div>

            <div className="mui-dialog-actions center">
              <button
                className="mui-button primary"
                type="button"
                onClick={handleClose}
              >
                Okay
              </button>
            </div>
          </div>
          <SmallNotificationPanel notifications={notifications} />
        </div>
      </div>
    )
  );
}

export default SwitchInfo;
