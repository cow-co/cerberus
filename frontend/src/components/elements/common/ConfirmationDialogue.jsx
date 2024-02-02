import { Dialog, DialogTitle, Button, Stack } from '@mui/material';
import { useSelector, useDispatch } from "react-redux";
import { setOpen } from '../../../common/redux/confirmation-slice';

const ConfirmationDialogue = () => {
  const message = useSelector((state) => state.confirmation.message);
  const isOpen = useSelector((state) => state.confirmation.open);
  const action = useSelector((state) => state.confirmation.onSubmit);
  const dispatch = useDispatch();

  return (
    <Dialog className="form-dialog" onClose={() => dispatch(setOpen(false))} open={isOpen}>
      <DialogTitle>{message}</DialogTitle>
      <Stack direction="row" spacing={6}>
        <Button onClick={() => dispatch(setOpen(false))} color="error" variant="contained">No</Button>
        <Button onClick={action} color="success" variant="contained">Yes</Button>
      </Stack>
    </Dialog>
  );
} 

export default ConfirmationDialogue;