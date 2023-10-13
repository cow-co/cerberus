import { useState } from 'react';
import { FormControl, Dialog, DialogTitle, Button, TextField, Typography, ListItem } from '@mui/material';
import { v4 as uuidv4 } from "uuid";

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
    updated.params.push({
      id: uuidv4(),
      name: ""
    });
    setTaskType(updated);
  }

  const deleteParam = (id) => {
    let updated = {
      name: taskType.name,
      params: taskType.params.filter(param => param.id !== id)
    };
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
    updated.params.forEach((param) => {
      if (param.id === id) {
        param.name = value;
      }
    });
    setTaskType(updated);
  }
  
  const paramsSettings = taskType.params.map((param) => (
    <ListItem>
      <Grid item xs={8}>
        <TextField className='text-input' variant="outlined" key={param.id} id={param.id} value={param.name} onChange={handleParamUpdate} />
      </Grid>
      <Grid item xs={4}>
        <IconButton onClick={() => deleteParam(param.id)}><DeleteForeverIcon /></IconButton>
      </Grid>
    </ListItem>
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