import { useState } from 'react';
import { FormControl, Dialog, DialogTitle, Button, TextField, Typography } from '@mui/material';

const CreateTaskDialogue = (props) => {
  const {onClose, open, onSubmit} = props;
  const [taskType, setTaskType] = useState({name: "", params: []});

  const handleClose = () => {
    onClose();
  }

  const handleSubmit = () => {
    onSubmit(taskType);
  }
  
  const handleAddParam = () => {
    let updated = {
      name: taskType.name,
      params: taskType.params
    };
    updated.params.push("");
    setTaskType(updated);
  }

  const handleNameUpdate = (event) => {
    const {value} = event.target;
    let updated = {
      name: value,
      params: taskType.params
    };
    setTaskType(updated);
  }

  const handleParamUpdate = (event) => {
    const {id, value} = event.target;
    let updated = {
      name: taskType.name,
      params: taskType.params
    };
    updated.params.forEach((param, index) => {
      if (index === id) {
        param = value;
      }
    });
    setTaskType(updated);
  }
  
  const paramsSettings = taskType.params.map((param, index) => (
    <TextField className='text-input' variant="outlined" key={index} id={index} value={param} onChange={handleParamUpdate} />
  ));

  return (
    <Dialog className="form-dialog" onClose={handleClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>Create New Task Type</DialogTitle>
      <FormControl fullWidth>
        <TextField className='text-input' variant="outlined" id="name-input" value={taskType.name} onChange={handleNameUpdate} />
        <Typography variant="h6">Parameters</Typography>
        {paramsSettings}
        <Button onClick={handleAddParam}>Add Parameter</Button>
        <Button onClick={handleSubmit}>Create</Button>
      </FormControl>
    </Dialog>
  );
}

export default CreateTaskDialogue;