import { useEffect, useState } from 'react';
import { FormControl, Dialog, DialogTitle, Button, TextField, MenuItem, Select, Typography, ListItem, Grid, IconButton, List } from '@mui/material';
import { v4 as uuidv4 } from "uuid";
import { getParamTypes } from '../../common/apiCalls';

const CreateACGDialogue = (props) => {
  const {onClose, open, onSubmit} = props;
  const [acg, setACG] = useState({name: ""});

  const handleClose = () => {
    onClose();
  }

  const handleSubmit = () => {
    const data = {
      name: acg.name,
    };
    onSubmit(data);
    setACG({name: ""});
  }

  const handleNameUpdate = (event) => {
    const {value} = event.target;
    let updated = {
      name: value,
    };
    setACG(updated);
  }

  return (
    <Dialog className="form-dialog" onClose={handleClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>Create New Access Control Group</DialogTitle>
      <FormControl fullWidth>
        <TextField className='text-input' variant="outlined" id="name-input" value={acg.name} onChange={handleNameUpdate} />
        <Button onClick={handleSubmit}>Create</Button>
      </FormControl>
    </Dialog>
  );
}

export default CreateACGDialogue;