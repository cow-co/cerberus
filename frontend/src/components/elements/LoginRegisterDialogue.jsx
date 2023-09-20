import { useState } from 'react';
import { FormControl, Dialog, DialogTitle, Button, TextField } from '@mui/material';

// props.mode should be either "login" or "register"
const LoginRegisterDialogue = (props) => {
  const {onClose, open, onSubmit, mode} = props;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleClose = () => {
    onClose();
  }

  const handleSubmit = () => {
    onSubmit(username, password);
  }

  const handleUsernameUpdate = (event) => {
    setUsername(event.target.value);
  }

  const handlePasswordUpdate = (event) => {
    setPassword(event.target.value);
  }
  const title = (mode === "register") ? (<DialogTitle>Register</DialogTitle>) : (<DialogTitle>Login</DialogTitle>)

  return (
    <Dialog className="form-dialog" onClose={handleClose} open={open} fullWidth maxWidth="md">
      {title}
      <FormControl fullWidth>
        <TextField className='text-input' label="Username" variant="outlined" value={username} onChange={handleUsernameUpdate} />
        <TextField className='text-input' label="Password" variant="outlined" value={password} onChange={handlePasswordUpdate} />
        <Button onClick={handleSubmit}>Submit</Button>
      </FormControl>
    </Dialog>
  );
}

export default LoginRegisterDialogue;