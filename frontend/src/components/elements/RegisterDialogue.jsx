import { useState } from 'react';
import { FormControl, Dialog, DialogTitle, Button, TextField } from '@mui/material';
import { register } from "../../common/apiCalls";
import { createErrorAlert, createSuccessAlert } from '../../common/redux/dispatchers';

const RegisterDialogue = (props) => {
  const {onClose, open} = props;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleClose = () => {
    setUsername("");
    setPassword("");
    onClose();
  }

  const handleSubmit = async () => {
    const response = await register(username, password);
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

  // TODO Password-confirmation field
  return (
    <Dialog className="form-dialog" onClose={handleClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>Register</DialogTitle>
      <FormControl fullWidth>
        <TextField className='text-input' label="Username" variant="outlined" value={username} onChange={handleUsernameUpdate} />
        <TextField type="password" className='text-input' label="Password" variant="outlined" value={password} onChange={handlePasswordUpdate} />
        <Button onClick={handleSubmit}>Submit</Button>
      </FormControl>
    </Dialog>
  );
}

export default RegisterDialogue;