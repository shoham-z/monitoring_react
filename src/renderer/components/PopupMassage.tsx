import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

function PopupMassage(props: {
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

  return (
    <div>
      <Dialog
        open={isOpen}
        onClose={() => handleClose()}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose()} color="primary">
            Okay
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default PopupMassage;
