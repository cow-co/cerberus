// This dialogue allows an admin to promote/demote another user to/from admin
// Also in future will allow creation of task types

import { useState } from 'react';
import { Dialog, DialogTitle, Button, TextField } from '@mui/material';
import { useDispatch } from "react-redux";

const AdminDialogue = (props) => {
  const {onClose, open, onSubmit} = props;
  const [user, setUser] = useState({id: "", name: ""});
  const dispatch = useDispatch();

  const handleChange = (event) => {
    setUsername({name: event.target.value});
  }

  const handleSubmit = () => {
    onSubmit(username);
  }

  const handleSearch = async () => {
    const response = await findUserByName(user.name);
    if (response.errors.length > 0) {
      response.errors.forEach((error) => {
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
          message: "Successfully found user"
        };
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(uuid)), conf.alertsTimeout);
        setUser({id: response.user._id, name: response.user.name});
    }
  }  

  return (
    <Dialog className="form-dialog" onClose={onClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>Administrator Interface</DialogTitle>
      {/* <FormControl fullWidth> */}
        <TextField className="text-input" variant="outlined" value={username} label="User to find" onChange={handleChange} />
        <Button onClick={handleSearch}>Search</Button>
        <Button onClick={handleSubmit}>Create</Button>
      {/* </FormControl> */}
    </Dialog>
  );
}

export default AdminDialogue;