import { useState, useEffect } from 'react';
import { fetchTaskTypes } from '../../../functions/apiCalls';
import { InputLabel, FormControl, MenuItem, Select, Dialog, DialogTitle, Button, TextField } from '@mui/material';
import { useSelector, useDispatch } from "react-redux";
import { setTaskTypes } from "../../../common/redux/tasks-slice";

const CreateTaskDialogue = (props) => {
  const {onClose, open, onSubmit} = props;
  const taskTypes = useSelector((state) => {
    return state.tasks.taskTypes
  });
  const dispatch = useDispatch();
  const [task, setTask] = useState({type: {id: "", name: ""}, params: []});

  useEffect(() => {
    const getData = async () => {
      const types = await fetchTaskTypes();
      if (types.errors.length === 0) {
        dispatch(setTaskTypes(types.taskTypes));
      } else {
        console.log("Error fetching task types: " + JSON.stringify(types.errors));
      }
    }
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (event) => {
    const selectedTaskTypes = taskTypes.filter(val => val.name === event.target.value);
    // Needs to be a new object, else React does not realise a change has been made, it seems
    let updated = {
      type: task.type,
      params: task.params
    };

    // The length *should* be precisely 1, but we cover off the scenario where we might have accidentally 
    // seeded multiple identical task types.
    if (selectedTaskTypes.length > 0) {
      const id = selectedTaskTypes[0]._id;
      const name = selectedTaskTypes[0].name;
      updated.type.id = id;
      updated.type.name = name;
      updated.params = selectedTaskTypes[0].params;
      updated.params = selectedTaskTypes[0].params.map(param => {
        return {
          name: param,
          value: ""
        }
      });
      setTask(updated);
    }
  }

  const handleClose = () => {
    onClose();
  }

  const handleSubmit = () => {
    onSubmit(task);
  }

  const handleParamUpdate = (event) => {
    const {id, value} = event.target;
    let updated = {
      type: task.type,
      params: task.params
    };
    updated.params.forEach(param => {
      if (param.name === id) {
        param.value = value;
      }
    });
    setTask(updated);
  }
  
  const taskTypeSelects = taskTypes.map(taskType => {
    return <MenuItem value={taskType.name} key={taskType._id} id={taskType._id}>{taskType.name}</MenuItem>
  });
  const paramsSettings = task.params.map(param => (
    <TextField className='text-input' label={param.name} variant="outlined" key={param.name} id={param.name} value={param.value} onChange={handleParamUpdate} />
  ));

  return (
    <Dialog className="form-dialog" onClose={handleClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>Create New Task</DialogTitle>
      <FormControl fullWidth>
        <InputLabel id="task-type-label">Task Type</InputLabel>
        <Select className="select-list" labelId="task-type-label" value={task.type.name} label="Task Type" onChange={handleChange}>
          {taskTypeSelects}
        </Select>
        {paramsSettings}
        <Button onClick={handleSubmit}>Create</Button>
      </FormControl>
    </Dialog>
  );
}

export default CreateTaskDialogue;