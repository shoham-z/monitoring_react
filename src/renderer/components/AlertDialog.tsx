import { Buffer } from 'buffer';
import '../styles/AlertDialog.css';

function AlertDialog(props: {
  isOpen: boolean;
  setIsOpen: any;
  title: string;
  message: string;
  onDelete: any;
}) {
  const { isOpen, setIsOpen, title, message, onDelete } = props;

  const handleClose = () => {
    setIsOpen(false);
    onDelete();
  };

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
        </div>
      </div>
    )
  );
}

export default AlertDialog;
