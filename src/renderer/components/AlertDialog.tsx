/* eslint-disable react/no-array-index-key */
/* eslint-disable react/button-has-type */
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

  // Split the message by newlines and map each part to a <p> element
  const messageLines = message.split('\n').map((line, index) => (
    <p key={index} className="mui-dialog-text">
      {line}
    </p>
  ));

  return (
    isOpen && (
      <div className="mui-dialog-backdrop">
        <div className="mui-dialog">
          <button className="mui-dialog-close" onClick={handleClose}>
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
            <button className="mui-button primary" onClick={handleClose}>
              Okay
            </button>
          </div>
        </div>
      </div>
    )
  );
}

export default AlertDialog;
