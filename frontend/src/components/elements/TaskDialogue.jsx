import { useState, useEffect } from 'react';
import { fetchTaskTypes } from '../../common/apiCalls';
import { InputLabel, FormControl, MenuItem, Select, Dialog, DialogTitle, Button, TextField } from '@mui/material';
import { useSelector, useDispatch } from "react-redux";
import { setTaskTypes } from "../../common/redux/tasks-slice";
import { createErrorAlert } from '../../common/redux/dispatchers';
import useWebSocket from 'react-use-websocket';
import { entityTypes, eventTypes } from "../../common/web-sockets";
import conf from "../../common/config/properties";

const TaskDialogue = ({open, onClose, onSubmit, providedTask}) => {
  const taskTypes = useSelector((state) => {
    return state.tasks.taskTypes
  });
  const dispatch = useDispatch();
  const [task, setTask] = useState({_id: "", taskType: {id: "", name: ""}, params: []});

  const { lastJsonMessage } = useWebSocket(conf.wsURL, {
    onOpen: () => {
      console.log("WebSocket opened");
    },
    share: true,  // This ensures we don't have a new connection for each component etc. 
    filter: (message) => {
      const data = JSON.parse(message.data);
      return data.entityType === entityTypes.TASK_TYPES;
    },
    retryOnError: true,
    shouldReconnect: () => true
  });

  useEffect(() => {
    // TODO Use the loadTaskTypes() function from dispatchers
    const getData = async () => {
      const types = await fetchTaskTypes();
      if (types.errors.length === 0) {
        dispatch(setTaskTypes(types.taskTypes));
      } else {
        createErrorAlert(types.errors);
      }
    };
    getData();
    setTask(providedTask);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (lastJsonMessage) {
      let updated = [...taskTypes];

      switch (lastJsonMessage.eventType) {
        case eventTypes.CREATE:
          updated.push(lastJsonMessage.entity);
          break;
        case eventTypes.DELETE:
          updated = updated.filter(taskType => taskType._id !== lastJsonMessage.entity._id);
          break;
      }

      dispatch(setTaskTypes(updated));
    }
  }, [lastJsonMessage]);

  const handleChange = (event) => {
    const selectedTaskTypes = taskTypes.filter(val => val.name === event.target.value);
    // Needs to be a new object, else React does not realise a change has been made, it seems
    let updated = {
      _id: task._id,
      taskType: task.taskType,
      params: task.params
    };

    // The length *should* be precisely 1, but we cover off the scenario where we might have accidentally 
    // seeded multiple identical task types.
    if (selectedTaskTypes.length > 0) {
      const id = selectedTaskTypes[0]._id;
      const name = selectedTaskTypes[0].name;
      updated.taskType.id = id;
      updated.taskType.name = name;
      updated.params = selectedTaskTypes[0].params;
      updated.params = selectedTaskTypes[0].params.map(param => {
        return {
          name: param.name,
          type: param.type,
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
    
    const newParams = task.params.map(param => {
      if (param.name === id) {
        return {
          name: param.name,
          value: value,
        };
      } else {
        return param;
      }
    });

    const updated = {
      _id: task._id,
      taskType: {
        id: task.taskType.id,
        name: task.taskType.name
      },
      params: newParams
    };
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
      <DialogTitle>Create/Edit Task</DialogTitle>
      <FormControl fullWidth>
        <InputLabel id="task-type-label">Task Type</InputLabel>
        <Select className="select-list" labelId="task-type-label" value={task.taskType.name} label="Task Type" onChange={handleChange}>
          {taskTypeSelects}
        </Select>
        {paramsSettings}
        <Button onClick={handleSubmit}>Set Task</Button>
      </FormControl>
    </Dialog>
  );
}

export default TaskDialogue;