import { Dialog, DialogTitle, Button, DialogContentText, FormControl } from '@mui/material';

const ConfirmationDialogue = (props) => {
  const {onClose, open, onOK} = props;

  return (
    <Dialog className="form-dialog" onClose={onClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>Are You Sure?</DialogTitle>
      <FormControl fullWidth>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onOK}>OK</Button>
      </FormControl>
    </Dialog>
  );
}

export default ConfirmationDialogue;