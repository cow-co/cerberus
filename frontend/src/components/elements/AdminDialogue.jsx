// This dialogue allows an admin to promote/demote another user to/from admin
// Also in future will allow creation of task types

import { useState } from 'react';
import { Dialog, DialogTitle, Button, TextField } from '@mui/material';
import { useDispatch } from "react-redux";
import CheckBox from '@mui/icons-material/CheckBox';
import { v4 as uuidv4 } from "uuid";
import conf from "../../common/config/properties";
import { addAlert, removeAlert } from "../../common/redux/alerts-slice";
import { findUserByName } from '../../functions/apiCalls';

const AdminDialogue = (props) => {
  const {onClose, open} = props;
  const [user, setUser] = useState({id: "", name: ""});
  const [searchError, setSearchError] = useState(false);
  const [helpText, setHelpText] = useState("");
  const dispatch = useDispatch();

  const handleChange = (event) => {
    setUser({name: event.target.value});
  }

  const handleSubmit = () => {
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
        setSearchError(true);
        setHelpText("Could not find user");
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
        setSearchError(false);
        setHelpText("Found User");
    }
  }  

  return (
    <Dialog className="form-dialog" onClose={onClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>Administrator Interface</DialogTitle>
      {/* <FormControl fullWidth> */}
        <TextField className="text-input" variant="outlined" value={user.name} label="User to find" type="search" onChange={handleChange} error={searchError} helperText={helpText} />
        <Button onClick={handleSearch}>Search</Button>
        <Button onClick={handleSubmit}>Submit</Button>
      {/* </FormControl> */}
    </Dialog>
  );
}

export default AdminDialogue;