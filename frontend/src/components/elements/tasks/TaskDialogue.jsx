import { useState, useEffect } from 'react';
import { fetchTaskTypes } from '../../../common/apiCalls';
import { InputLabel, FormControl, MenuItem, Select, Dialog, DialogTitle, Button, TextField } from '@mui/material';
import { useSelector, useDispatch } from "react-redux";
import { setSelectedTask, setTaskTypes } from "../../../common/redux/tasks-slice";
import { createErrorAlert } from '../../../common/redux/dispatchers';
import useWebSocket from 'react-use-websocket';
import { entityTypes, eventTypes } from "../../../common/web-sockets";
import conf from "../../../common/config/properties";

const TaskDialogue = ({open, onClose, onSubmit}) => {
  const taskTypes = useSelector((state) => {
    return state.tasks.taskTypes
  });
  const selectedTask = useSelector((state) => {
    return state.tasks.selected
  });
  const dispatch = useDispatch();
  const [task, setTask] = useState(selectedTask);

  const { lastJsonMessage } = useWebSocket(conf.wsURL, {
    share: true,  // This ensures we don't have a new connection for each component etc. 
    filter: (message) => {
      const data = JSON.parse(message.data);
      return data.entityType === entityTypes.TASK_TYPES;
    },
    retryOnError: true,
    shouldReconnect: () => true
  });

  useEffect(() => {
    const getData = async () => {
      const types = await fetchTaskTypes();
      if (types.errors.length === 0) {
        dispatch(setTaskTypes(types.taskTypes));
      } else {
        createErrorAlert(types.errors);
      }
    };
    getData();
    setTask(selectedTask);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTask]);

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
        default:
          break;
      }

      dispatch(setTaskTypes(updated));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);

  const handleChange = (event) => {
    const selectedTaskTypes = taskTypes.filter(val => val.name === event.target.value);
    // Needs to be a new object, else React does not realise a change has been made, it seems
    let updated = structuredClone(task);

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
    setTask({_id: "", implantId: "", taskType: {id: "", name: ""}, params: []});
    onClose();
  }

  const handleSubmit = () => {
    dispatch(setSelectedTask(task));
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
      implantId: task.implantId,
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
      </FormControl>
      <FormControl fullWidth>
        {paramsSettings}
      </FormControl>
      <Button onClick={handleSubmit}>Set Task</Button>
    </Dialog>
  );
}

export default TaskDialogue;