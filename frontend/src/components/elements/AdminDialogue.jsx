// This dialogue allows an admin to promote/demote another user to/from admin
// Also in future will allow creation of task types

import { useState } from 'react';
import { Dialog, DialogTitle, Button, TextField, Checkbox, Typography, FormControlLabel, FormGroup } from '@mui/material';
import { useDispatch } from "react-redux";
import conf from "../../common/config/properties";
import { addAlert, removeAlert } from "../../common/redux/alerts-slice";
import { changeAdminStatus, findUserByName } from '../../functions/apiCalls';
import { generateAlert } from "../../common/utils";

const AdminDialogue = (props) => {
  const {onClose, open} = props;
  const [user, setUser] = useState({id: "", name: ""});
  const [searchError, setSearchError] = useState(false);
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [helpText, setHelpText] = useState("");
  const dispatch = useDispatch();

  const handleChange = (event) => {
    setUser({name: event.target.value});
  }

  const handleSubmit = async () => {
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
        // FIXME This alert might not be working?
        const alert = generateAlert("Successfully changed user admin status", "success");
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(alert.id)), conf.alertsTimeout);
        setHelpText("Changed user admin status");
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
    } else {
        const alert = generateAlert("Successfully found", "success");
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(alert.id)), conf.alertsTimeout);
        setUser({id: response.user._id, name: response.user.name});
        setSearchError(false);
        setHelpText("Found User");
    }
  }  

  return (
    <Dialog className="form-dialog" onClose={onClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>Administrator Interface</DialogTitle>
      <FormGroup>
        <TextField className="text-input" variant="outlined" value={user.name} label="User to find" type="search" onChange={handleChange} error={searchError} helperText={helpText} />
        <FormControlLabel control={<Checkbox checked={makeAdmin} onClick={() => setMakeAdmin(!makeAdmin)} />} label="Make User Admin" />
        <Typography variant="body1">Selected User ID: {user.id}</Typography>
        <Button onClick={handleSearch}>Search</Button>
        <Button onClick={handleSubmit} disabled={user.id === ""}>Submit</Button>
      </FormGroup>
    </Dialog>
  );
}

export default AdminDialogue;