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
      <p key={key} className="alert-dialog-text">
        {line}
      </p>
    );
  });

  return (
    isOpen && (
      <div className="alert-dialog-backdrop">
        <div className="alert-dialog">
          <div className="alert-dialog-container">
            <button
              className="alert-dialog-close"
              type="button"
              onClick={handleClose}
            >
              &times;
            </button>

            <div className="alert-dialog-title" id="alert-dialog-title">
              {title}
            </div>

            <div className="alert-dialog-content">
              {/* Render each line of the message */}
              {messageLines}
            </div>

            <div className="alert-dialog-actions center">
              <button
                className="alert-button primary"
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
