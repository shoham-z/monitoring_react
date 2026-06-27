import '../styles/ConfirmationDialog.css';
import { useTranslation } from 'react-i18next';

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

  const { t } = useTranslation();

  return (
    isOpen && (
      <div className="custom-dialog-backdrop">
        <div className="custom-dialog">
          <div className="custom-dialog-title">
            {t('confirmationDialogTitle', { ip })}
          </div>
          <div className="custom-dialog-actions">
            <button
              className="custom-dialog-button"
              type="button"
              onClick={() => handleClose(false)}
            >
              {t('no')}
            </button>
            <button
              className="custom-dialog-button primary"
              type="button"
              onClick={() => handleClose(true)}
            >
              {t('yes')}
            </button>
          </div>
        </div>
      </div>
    )
  );
}

export default ConfirmationDialog;
