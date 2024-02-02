import { useEffect, useState } from 'react';
import { FormControl, Dialog, DialogTitle, Button, TextField, MenuItem, Select, Typography, ListItem, Grid, IconButton, List, InputLabel } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { v4 as uuidv4 } from "uuid";
import { getParamTypes } from '../../../common/apiCalls';

const CreateTaskTypeDialogue = (props) => {
  const {onClose, open, onSubmit} = props;
  // Each param will have structure
  // - name
  // - data type
  const [taskType, setTaskType] = useState({name: "", params: []});
  const [paramTypes, setParamTypes] = useState([]);

  useEffect(() => {
    async function callFetcher() {
      const res = await getParamTypes();
      if (res.dataTypes) {
        setParamTypes(res.dataTypes);
      } else {
        setParamTypes([]);
      }
    }

    callFetcher();
  }, [open])

  const handleClose = () => {
    onClose();
  }

  const handleSubmit = () => {
    const data = {
      name: taskType.name,
      params: taskType.params.map(param => {
        return {
          name: param.name,
          type: param.type
        }
      })
    };
    onSubmit(data);
    setTaskType({name: "", params: []});
  }
  // FIXME the select-input-label in a slightly iffy place
  
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

  const handleParamNameUpdate = (event) => {
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
  };

  const handleParamTypeChange = (event) => {
    const {name, value} = event.target;
    let updated = {
      name: taskType.name,
      params: taskType.params
    };
    updated.params.forEach((param) => {
      if (param.id === name) {
        param.type = value;
      }
    });
    setTaskType(updated);
  };

  const dataTypeSelects = paramTypes.map(paramType => {
    return <MenuItem value={paramType} key={paramType} id={paramType}>{paramType}</MenuItem>
  });
  
  const paramsSettings = taskType.params.map((param) => (
    <ListItem className="listElement" key={param.id} >
      <Grid item xs={7}>
        <TextField fullWidth className='text-input' variant="outlined" key={param.id} id={param.id} value={param.name} onChange={handleParamNameUpdate} />
      </Grid>
      <Grid item xs={4}>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="data-type-label">Data Type</InputLabel>
          <Select className="select-list" label="Data Type" labelId="data-type-label" value={param.type} onChange={handleParamTypeChange} name={param.id} id={param.name}>
            {dataTypeSelects}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={1}>
        <IconButton onClick={() => deleteParam(param.id)}><DeleteForeverIcon /></IconButton>
      </Grid>
    </ListItem>
  ));

  // TODO The name input should have a label/placeholder
  return (
    <Dialog className="form-dialog" onClose={handleClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>Create New Task Type</DialogTitle>
      <FormControl fullWidth>
        <TextField className='text-input' variant="outlined" id="name-input" value={taskType.name} onChange={handleNameUpdate} />
        <Typography variant="h6">Parameters</Typography>
        <List>
          {paramsSettings}
        </List>
        <Button onClick={handleAddParam}>Add Parameter</Button>
        <Button onClick={handleSubmit}>Create</Button>
      </FormControl>
    </Dialog>
  );
}

export default CreateTaskTypeDialogue;