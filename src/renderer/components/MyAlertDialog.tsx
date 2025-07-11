/* eslint-disable react/button-has-type */
import { useEffect, useState } from 'react';
import '../styles/MyAlertDialog.css';

function MyAlertDialog(props: {
  ip: string;
  isOpen: boolean;
  setIsOpen: any;
  returnChoice: any;
}) {
  const { ip, isOpen, setIsOpen, returnChoice } = props;
  const [divClass, setDivClass] = useState('');

  useEffect(() => {
    console.log(isOpen);
    setDivClass(isOpen ? 'my-alert open' : 'my-alert');
  }, [isOpen]);

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
              onClick={() => handleClose(false)}
            >
              No
            </button>
            <button
              className="custom-dialog-button primary"
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

export default MyAlertDialog;
