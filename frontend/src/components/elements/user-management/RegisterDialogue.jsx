import { useState } from 'react';
import { FormControl, Dialog, DialogTitle, Button, TextField } from '@mui/material';
import { register } from "../../../functions/apiCalls";
import { useDispatch } from "react-redux";
import conf from "../../../common/config/properties";
import { addAlert, removeAlert } from "../../../common/redux/alerts-slice";
import { generateAlert } from "../../../common/utils";

const RegisterDialogue = (props) => {
  const {onClose, open} = props;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const handleClose = () => {
    onClose();
  }

  const handleSubmit = async () => {
    const errors = await register(username, password);
    if (errors.length > 0) {
      errors.forEach((error) => {
        const alert = generateAlert(error, "error");
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(alert.id)), conf.alertsTimeout);
      });
    } else {
        const alert = generateAlert("Successfully registered", "success");
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(alert.id)), conf.alertsTimeout);
        handleClose();
    }
  }

  const handleUsernameUpdate = (event) => {
    setUsername(event.target.value);
  }

  const handlePasswordUpdate = (event) => {
    setPassword(event.target.value);
  }

  return (
    <Dialog className="form-dialog" onClose={handleClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>Register</DialogTitle>
      <FormControl fullWidth>
        <TextField className='text-input' label="Username" variant="outlined" value={username} onChange={handleUsernameUpdate} />
        <TextField className='text-input' label="Password" variant="outlined" value={password} onChange={handlePasswordUpdate} />
        <Button onClick={handleSubmit}>Submit</Button>
      </FormControl>
    </Dialog>
  );
}

export default RegisterDialogue;