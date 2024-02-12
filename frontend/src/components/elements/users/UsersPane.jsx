// This pane allows an admin to promote/demote another user to/from admin
// Also in future will allow creation of task types

import { useState } from 'react';
import { Button, TextField, Typography, FormGroup, Container } from '@mui/material';
import { findUserByName } from '../../../common/apiCalls';
import { createErrorAlert, createSuccessAlert } from '../../../common/redux/dispatchers';
import { useSelector, useDispatch } from "react-redux";
import { setSelectedUser } from '../../../common/redux/users-slice';
import UserDialogue from './UserDialogue';
import { EMPTY_USER } from '../../../common/utils';

const UsersPane = () => {
  const selectedUser = useSelector((state) => {
    return state.users.selectedUser;
  });
  const [user, setUser] = useState(EMPTY_USER);
  const [searchError, setSearchError] = useState(false);
  const [userEditOpen, setUserEditOpen] = useState(false);
  const [helpText, setHelpText] = useState("");
  const dispatch = useDispatch();

  const handleChange = (event) => {
    setUser({name: event.target.value});
  }

  const handleSearch = async () => {
    const response = await findUserByName(user.name);
    if (response.errors.length > 0) {
      createErrorAlert(response.errors);
      setSearchError(true);
      setHelpText("Could not find user");
      dispatch(setSelectedUser(EMPTY_USER));
    } else if (response.user._id) {
      createSuccessAlert("Successfully found");
      dispatch(setSelectedUser({_id: response.user._id, name: response.user.name, acgs: response.user.acgs, isAdmin: response.user.isAdmin}));
      setSearchError(false);
      setHelpText("Found User");
    } else {
      setSearchError(true);
      setHelpText("Could not find user");
      dispatch(setSelectedUser(EMPTY_USER));
    }
  }
  
  return (
    <Container fixed>
      <Typography align="center" variant="h3">Manage Users</Typography>
      <FormGroup>
        <TextField className="text-input" variant="outlined" value={user.name} label="User to find" type="search" onChange={handleChange} error={searchError} helperText={helpText} />
        <Typography variant="body1">Selected User ID: {selectedUser._id}</Typography>
        <Button onClick={handleSearch}>Search</Button>
        <Button onClick={() => setUserEditOpen(true)} disabled={selectedUser._id === ""}>Edit User</Button>
      </FormGroup>
      <UserDialogue open={userEditOpen} onClose={() => setUserEditOpen(false)} onSubmit={() => alert("PLACEHOLDER")} />
    </Container>
  );
}

export default UsersPane;