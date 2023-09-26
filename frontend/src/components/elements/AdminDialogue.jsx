// This dialogue allows an admin to promote/demote another user to/from admin
// Also in future will allow creation of task types

import { useState, useEffect } from 'react';
import { FormControl, Dialog, DialogTitle, Button, TextField } from '@mui/material';
import { useSelector, useDispatch } from "react-redux";

const AdminDialogue = (props) => {
  const {onClose, open, onSubmit} = props;
  const [username, setUsername] = useState("");


  const handleChange = (event) => {
    setUsername(event.target.value);
  }

  return (
    <Dialog className="form-dialog" onClose={onClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>Administrator Interface</DialogTitle>
      <FormControl fullWidth>
        <TextField className="text-input" variant="outlined" value={username} label="User to find" onChange={handleChange} />
        <Button onClick={onSubmit}>Create</Button>
      </FormControl>
    </Dialog>
  );
}

export default AdminDialogue;