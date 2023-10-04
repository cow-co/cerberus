import { useState } from 'react';
import { FormControl, Dialog, DialogTitle, Button, TextField } from '@mui/material';
import { login } from "../../functions/apiCalls";
import { useDispatch } from "react-redux";
import conf from "../../common/config/properties";
import { addAlert, removeAlert } from "../../common/redux/alerts-slice";
import { setUsername } from "../../common/redux/users-slice";
import { generateAlert } from "../../common/utils";

const LoginDialogue = (props) => {
  const {onClose, open} = props;
  const [currentUsername, setCurrentUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const handleClose = () => {
    onClose();
  }

  const handleSubmit = async () => {
    const response = await login(currentUsername, password);
    if (response.errors.length > 0) {
      response.errors.forEach((error) => {
        const alert = generateAlert(error, "error");
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(alert.id)), conf.alertsTimeout);
      });
    } else {
        const alert = generateAlert("Successfully logged in", "success");
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(alert.id)), conf.alertsTimeout);
        dispatch(setUsername(response.username));
        handleClose();
    }
  }

  const handleUsernameUpdate = (event) => {
    setCurrentUsername(event.target.value);
  }

  const handlePasswordUpdate = (event) => {
    setPassword(event.target.value);
  }

  return (
    <Dialog className="form-dialog" onClose={handleClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>Login</DialogTitle>
      <FormControl fullWidth>
        <TextField className='text-input' label="Username" variant="outlined" value={currentUsername} onChange={handleUsernameUpdate} />
        <TextField type="password" className='text-input' label="Password" variant="outlined" value={password} onChange={handlePasswordUpdate} />
        <Button onClick={handleSubmit}>Submit</Button>
      </FormControl>
    </Dialog>
  );
}

export default LoginDialogue;