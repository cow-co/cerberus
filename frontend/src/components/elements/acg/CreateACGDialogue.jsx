import { useState } from 'react';
import { FormControl, Dialog, DialogTitle, Button, TextField } from '@mui/material';

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
        <TextField className='text-input' label="ACG Name" variant="outlined" id="name-input" value={acg.name} onChange={handleNameUpdate} />
        <Button onClick={handleSubmit}>Create</Button>
      </FormControl>
    </Dialog>
  );
}

export default CreateACGDialogue;