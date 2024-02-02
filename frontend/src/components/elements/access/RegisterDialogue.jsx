import { useState } from 'react';
import { FormControl, Dialog, DialogTitle, Button, TextField } from '@mui/material';
import { register } from "../../../common/apiCalls";
import { createErrorAlert, createSuccessAlert } from '../../../common/redux/dispatchers';

// TODO If PKI enabled (how will the frontend know this?) just have this be a simple button, and the backend pulls the username from the CN
const RegisterDialogue = (props) => {
  const {onClose, open} = props;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleClose = () => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    onClose();
  }

  const handleSubmit = async () => {
    const response = await register(username, password, confirmPassword);
    if (response.errors.length > 0) {
      createErrorAlert(response.errors);
    } else {
        createSuccessAlert("Successfully registered");
        handleClose();
    }
  }

  const handleUsernameUpdate = (event) => {
    setUsername(event.target.value);
  }

  const handlePasswordUpdate = (event) => {
    setPassword(event.target.value);
  }

  const handleConfirmPasswordUpdate = (event) => {
    if (event.target.value !== password) {
      setError("Password and Confirmation must match");
    } else {
      setError("");
    }
    setConfirmPassword(event.target.value);
  }

  return (
    <Dialog className="form-dialog" onClose={handleClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>Register</DialogTitle>
      <FormControl fullWidth>
        <TextField className='text-input' label="Username" variant="outlined" value={username} onChange={handleUsernameUpdate} />
        <TextField type="password" className='text-input' label="Password" variant="outlined" value={password} onChange={handlePasswordUpdate} />
        <TextField type="password" className='text-input' label="Confirm Password" variant="outlined" value={confirmPassword} error={error !== ""} helperText={error} onChange={handleConfirmPasswordUpdate} />
        <Button onClick={handleSubmit} disabled={error !== ""}>Submit</Button>
      </FormControl>
    </Dialog>
  );
}

export default RegisterDialogue;