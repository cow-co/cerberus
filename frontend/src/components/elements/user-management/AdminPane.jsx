// This pane allows an admin to promote/demote another user to/from admin
// Also in future will allow creation of task types

import { useState } from 'react';
import { Dialog, DialogTitle, Button, TextField, Checkbox, Typography, FormControlLabel, FormGroup, Container } from '@mui/material';
import { useDispatch } from "react-redux";
import conf from "../../../common/config/properties";
import { addAlert, removeAlert } from "../../../common/redux/alerts-slice";
import { changeAdminStatus, deleteUser, findUserByName } from '../../../functions/apiCalls';
import { generateAlert } from "../../../common/utils";

const AdminPane = () => {
  const [user, setUser] = useState({id: "", name: ""});
  const [searchError, setSearchError] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [helpText, setHelpText] = useState("");
  const dispatch = useDispatch();

  const handleChange = (event) => {
    setUser({name: event.target.value});
  }

  const handleSubmitAdminStatus = async () => {
    const errors = await changeAdminStatus(user.id, makeAdmin);
    if (errors.length > 0) {
      errors.forEach((error) => {
        const alert = generateAlert(error, "error");
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(alert.id)), conf.alertsTimeout);
      });
      setHelpText("Could not change user's admin status");
      setUser({id: "", name: ""});
    } else {
        const alert = generateAlert("Successfully changed user admin status", "success");
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(alert.id)), conf.alertsTimeout);
        setHelpText("Changed user admin status");
        setUser({id: "", name: ""});
    }
  }

  const handleSubmitDelete = async () => {
    const errors = await deleteUser(user.id);
    if (errors.length > 0) {
      errors.forEach((error) => {
        const alert = generateAlert(error, "error");
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(alert.id)), conf.alertsTimeout);
      });
      setHelpText("Could not delete user");
      setUser({id: "", name: ""});
    } else {
        const alert = generateAlert("Successfully deleted user", "success");
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(alert.id)), conf.alertsTimeout);
        setHelpText("User deleted");
        setUser({id: "", name: ""});
    }
  }

  const handleSearch = async () => {
    const response = await findUserByName(user.name);
    if (response.errors.length > 0) {
      response.errors.forEach((error) => {
        const alert = generateAlert(error, "error");
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(alert.id)), conf.alertsTimeout);
      });
      setSearchError(true);
      setHelpText("Could not find user");
    } else if (response.user !== null) {
        const alert = generateAlert("Successfully found", "success");
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(alert.id)), conf.alertsTimeout);
        setUser({id: response.user.id, name: response.user.name});
        setSearchError(false);
        setHelpText("Found User");
    } else {
      setSearchError(true);
      setHelpText("Could not find user");
    }
  }  

  return (
    <Container fixed>
      <Typography align="center" variant="h3">Administrator Interface</Typography>
      <FormGroup>
        <TextField className="text-input" variant="outlined" value={user.name} label="User to find" type="search" onChange={handleChange} error={searchError} helperText={helpText} />
        <FormControlLabel control={<Checkbox checked={makeAdmin} onClick={() => setMakeAdmin(!makeAdmin)} />} label="Make User Admin" />
        <Typography variant="body1">Selected User ID: {user.id}</Typography>
        <Button onClick={handleSearch}>Search</Button>
        <Button onClick={handleSubmitAdminStatus} disabled={user.id === ""}>Change User Admin Status</Button>
        <Button onClick={() => setConfirmationOpen(true)} disabled={user.id === ""}>Delete User</Button>
      </FormGroup>
      <Dialog open={confirmationOpen} onClose={() => setConfirmationOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Are You Sure?</DialogTitle>
        <Typography variant="body1">You are going to delete user {user.name}</Typography>
        <Button onClick={handleSubmitDelete}>Confirm</Button>
        <Button onClick={() => setConfirmationOpen(false)}>Cancel</Button>
      </Dialog>
    </Container>
  );
}

export default AdminPane;