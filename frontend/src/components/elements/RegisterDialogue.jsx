import { useState } from 'react';
import { FormControl, Dialog, DialogTitle, Button, TextField } from '@mui/material';
import { register } from "../../functions/apiCalls";
import { useSelector, useDispatch } from "react-redux";
import conf from "../../common/config/properties";
import { addAlert, removeAlert } from "../../common/redux/alerts-slice";

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
        // TODO Make a utility method to generate an alert
        const uuid = uuidv4();
        const alert = {
          id: uuid,
          type: "error",
          message: error
        };
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(uuid)), conf.alertsTimeout);
      });
    } else {
        const uuid = uuidv4();
        const alert = {
          id: uuid,
          type: "success",
          message: "Successfully registered"
        };
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(uuid)), conf.alertsTimeout);
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