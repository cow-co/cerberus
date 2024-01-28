// This pane allows an admin to promote/demote another user to/from admin
// Also in future will allow creation of task types

import { useState } from 'react';
import { Button, TextField, Checkbox, Typography, FormControlLabel, FormGroup, Container } from '@mui/material';
import { changeAdminStatus, deleteUser, findUserByName } from '../../common/apiCalls';
import { createErrorAlert, createSuccessAlert } from '../../common/redux/dispatchers';
import ConfirmationDialogue from './ConfirmationDialogue';

const UsersPane = () => {
  const [user, setUser] = useState({id: "", name: ""});
  const [searchError, setSearchError] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [helpText, setHelpText] = useState("");

  const handleChange = (event) => {
    setUser({name: event.target.value});
  }

  const handleSubmitAdminStatus = async () => {
    const { errors } = await changeAdminStatus(user.id, makeAdmin);
    if (errors.length > 0) {
      createErrorAlert(errors);
      setHelpText("Could not change user's admin status");
      setUser({id: "", name: ""});
    } else {
      createSuccessAlert("Successfully changed user admin status");
      setHelpText("Changed user admin status");
      setUser({id: "", name: ""});
    }
  }

  const handleSubmitDelete = async () => {
    const { errors } = await deleteUser(user.id);
    if (errors.length > 0) {
      createErrorAlert(errors);
      setHelpText("Could not delete user");
      setUser({id: "", name: ""});
    } else {
      createSuccessAlert("Successfully deleted user");
      setHelpText("User deleted");
      setUser({id: "", name: ""});
    }
  }

  const handleSearch = async () => {
    const response = await findUserByName(user.name);
    if (response.errors.length > 0) {
      createErrorAlert(response.errors);
      setSearchError(true);
      setHelpText("Could not find user");
    } else if (response.user.id) {
      createSuccessAlert("Successfully found");
      setUser({id: response.user.id, name: response.user.name});
      setSearchError(false);
      setHelpText("Found User");
    } else {
      setSearchError(true);
      setHelpText("Could not find user");
    }
  }  

  // TODO Button for updating their groups
  return (
    <Container fixed>
      <Typography align="center" variant="h3">Manage Users</Typography>
      <FormGroup>
        <TextField className="text-input" variant="outlined" value={user.name} label="User to find" type="search" onChange={handleChange} error={searchError} helperText={helpText} />
        <FormControlLabel control={<Checkbox checked={makeAdmin} onClick={() => setMakeAdmin(!makeAdmin)} />} label="Make User Admin" />
        <Typography variant="body1">Selected User ID: {user.id}</Typography>
        <Button onClick={handleSearch}>Search</Button>
        <Button onClick={handleSubmitAdminStatus} disabled={user.id === ""}>Change User Admin Status</Button>
        <Button onClick={() => setConfirmationOpen(true)} disabled={user.id === ""}>Delete User</Button>
      </FormGroup>
      <ConfirmationDialogue open={confirmationOpen} onClose={() => setConfirmationOpen(false)} onOK={handleSubmitDelete} />
    </Container>
  );
}

export default UsersPane;