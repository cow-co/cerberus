import { Dialog, DialogTitle, Button, DialogContentText } from '@mui/material';

const ConfirmationDialogue = (props) => {
  const {onClose, open, onOK, onCancel, text} = props;

  return (
    <Dialog className="form-dialog" onClose={onClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>Are You Sure?</DialogTitle>
      <DialogContentText>
        {text}
      </DialogContentText>
      <FormControl fullWidth>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onOK}>OK</Button>
      </FormControl>
    </Dialog>
  );
}

export default ConfirmationDialogue;