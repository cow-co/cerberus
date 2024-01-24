import { Dialog, DialogTitle, Button, DialogContentText, FormControl } from '@mui/material';

const ConfirmationDialogue = (props) => {
  const {onClose, open, onOK} = props;

  // TODO Perhaps have only one of these - at the page-level, and pass down to the panes a functiopn which takes the ok-function and opens the confirmation dialogue?
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