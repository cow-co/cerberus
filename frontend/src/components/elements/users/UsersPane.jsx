// This pane allows an admin to promote/demote another user to/from admin
// Also in future will allow creation of task types

import { useState } from 'react';
import { Button, TextField, Typography, FormGroup, Container } from '@mui/material';
import { deleteUser, findUserByName } from '../../../common/apiCalls';
import { createErrorAlert, createSuccessAlert } from '../../../common/redux/dispatchers';
import ConfirmationDialogue from '../common/ConfirmationDialogue';
import UserDialogue from './UserDialogue';

const UsersPane = () => {
  const [user, setUser] = useState({id: "", name: "", acgs: []});
  const [searchError, setSearchError] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [helpText, setHelpText] = useState("");

  const handleChange = (event) => {
    setUser({name: event.target.value});
  }

  const handleSubmitDelete = async () => {
    const { errors } = await deleteUser(user.id);
    if (errors.length > 0) {
      createErrorAlert(errors);
      setHelpText("Could not delete user");
      setUser({id: "", name: "", acgs: []});
    } else {
      createSuccessAlert("Successfully deleted user");
      setHelpText("User deleted");
      setUser({id: "", name: "", acgs: []});
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
      setUser({id: response.user.id, name: response.user.name, acgs: response.user.acgs});
      setSearchError(false);
      setHelpText("Found User");
    } else {
      setSearchError(true);
      setHelpText("Could not find user");
    }
  }  

  // TODO Edit button
  return (
    <Container fixed>
      <Typography align="center" variant="h3">Manage Users</Typography>
      <FormGroup>
        <TextField className="text-input" variant="outlined" value={user.name} label="User to find" type="search" onChange={handleChange} error={searchError} helperText={helpText} />
        <Typography variant="body1">Selected User ID: {user.id}</Typography>
        <Button onClick={handleSearch}>Search</Button>
      </FormGroup>
      <UserDialogue open={confirmationOpen} onClose={() => setConfirmationOpen(false)} onOK={handleSubmitDelete} />
      <ConfirmationDialogue open={confirmationOpen} onClose={() => setConfirmationOpen(false)} onOK={handleSubmitDelete} />
    </Container>
  );
}

export default UsersPane;