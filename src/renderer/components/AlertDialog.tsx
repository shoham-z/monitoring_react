import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

function AlertDialog(props: {
  isOpen: boolean;
  setIsOpen: any;
  returnChoice: any;
}) {
  const { isOpen, setIsOpen, returnChoice } = props;

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Successful Alert</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You are successful in life!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => returnChoice(false)} color="primary">
            Disagree
          </Button>
          <Button onClick={() => returnChoice(true)} color="primary" autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AlertDialog;
