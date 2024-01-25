import { Dialog, DialogTitle, Button, Stack } from '@mui/material';

const ConfirmationDialogue = (props) => {
  const {onClose, open, onOK} = props;

  return (
    <Dialog className="form-dialog" onClose={onClose} open={open}>
      <DialogTitle>Are You Sure?</DialogTitle>
      <Stack direction="row" spacing={6}>
        <Button onClick={onClose} color="error" variant="contained">No</Button>
        <Button onClick={onOK} color="success" variant="contained">Yes</Button>
      </Stack>
    </Dialog>
  );
}

export default ConfirmationDialogue;