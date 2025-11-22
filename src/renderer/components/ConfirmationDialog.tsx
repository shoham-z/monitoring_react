import '../styles/ConfirmationDialog.css';

function ConfirmationDialog(props: {
  ip: string;
  isOpen: boolean;
  setIsOpen: any;
  returnChoice: any;
}) {
  const { ip, isOpen, setIsOpen, returnChoice } = props;

  const handleClose = (choice: boolean) => {
    setIsOpen(false);
    returnChoice(choice);
  };

  return (
    isOpen && (
      <div className="custom-dialog-backdrop">
        <div className="custom-dialog">
          <div className="custom-dialog-title">
            Are you sure you want to delete item {ip}?
          </div>
          <div className="custom-dialog-actions">
            <button
              className="custom-dialog-button"
              type="button"
              onClick={() => handleClose(false)}
            >
              No
            </button>
            <button
              className="custom-dialog-button primary"
              type="button"
              onClick={() => handleClose(true)}
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    )
  );
}

export default ConfirmationDialog;
