import { useState, useEffect } from 'react';
import { fetchTaskTypes } from '../../common/apiCalls';
import { InputLabel, FormControl, MenuItem, Select, Dialog, DialogTitle, Button, TextField } from '@mui/material';
import { useSelector, useDispatch } from "react-redux";
import { setTaskTypes } from "../../common/redux/tasks-slice";
import { createErrorAlert } from '../../common/redux/dispatchers';
import useWebSocket from 'react-use-websocket';
import { entityTypes, eventTypes } from "../../common/web-sockets";
import conf from "../../common/config/properties";
import { setGroups } from '../../common/redux/groups-slice';

const ImplantACGDialogue = ({open, onClose, onSubmit, providedACGs}) => {
  const groups = useSelector((state) => {
    return state.groups.groups
  });
  const dispatch = useDispatch();
  const [acgs, setACGs] = useState({readOnlyACGs: [], operatorACGs: []});

  const { lastJsonMessage } = useWebSocket(conf.wsURL, {
    onOpen: () => {
      console.log("WebSocket opened");
    },
    share: true,  // This ensures we don't have a new connection for each component etc. 
    filter: (message) => {
      const data = JSON.parse(message.data);
      return data.entityType === entityTypes.GROUPS;
    },
    retryOnError: true,
    shouldReconnect: () => true
  });

  useEffect(() => {
    const getData = async () => {
      const groups = await fetchGroups();
      if (groups.errors.length === 0) {
        dispatch(setGroups(groups.acgs));
      } else {
        createErrorAlert(groups.errors);
      }
    };
    getData();
    setACGs(providedACGs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (lastJsonMessage) {
      let updated = [...groups];

      switch (lastJsonMessage.eventType) {
        case eventTypes.CREATE:
          updated.push(lastJsonMessage.entity);
          break;
        case eventTypes.DELETE:
          updated = updated.filter(group => group._id !== lastJsonMessage.entity._id);
          break;
        default:
          break;
      }

      dispatch(setGroups(updated));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setACGs({readOnlyACGs: [], operatorACGs: []});
    onClose();
  }

  const handleSubmit = () => {
    onSubmit(task);
  }

  const groupSelects = groups.map(group => {
    return <MenuItem value={group.name} key={group._id} id={group._id}>{group.name}</MenuItem>
  });
  
  const readGroupsSettings = acgs.readOnlyACGs.map((acg) => (
    <ListItem className="listElement" key={acg._id} >
      <Grid item xs={7}>
        <TextField fullWidth className='text-input' variant="outlined" key={acg._id} id={acg._id} value={acg.name} onChange={handleParamNameUpdate} />
      </Grid>
      <Grid item xs={4}>
        <Select className="select-list" label="Data Type" value={acg.type} onChange={handleParamTypeChange} name={acg._id} id={acg.name}>
          {groupSelects}
        </Select>
      </Grid>
      <Grid item xs={1}>
        <IconButton onClick={() => deleteReadACG(acg._id)}><DeleteForeverIcon /></IconButton>
      </Grid>
    </ListItem>
  ));
  
  const operatorGroupsSettings = acgs.operatorACGs.map((acg) => (
    <ListItem className="listElement" key={acg._id} >
      <Grid item xs={7}>
        <TextField fullWidth className='text-input' variant="outlined" key={acg._id} id={acg._id} value={acg.name} onChange={handleParamNameUpdate} />
      </Grid>
      <Grid item xs={4}>
        <Select className="select-list" label="Data Type" value={acg.type} onChange={handleParamTypeChange} name={acg._id} id={acg.name}>
          {groupSelects}
        </Select>
      </Grid>
      <Grid item xs={1}>
        <IconButton onClick={() => deleteOperatorACG(acg._id)}><DeleteForeverIcon /></IconButton>
      </Grid>
    </ListItem>
  ));

  return (
    <Dialog className="form-dialog" onClose={handleClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>Create/Edit Task</DialogTitle>
      <FormControl fullWidth>
        <InputLabel id="task-type-label">Task Type</InputLabel>
        <Select className="select-list" labelId="task-type-label" value={task.taskType.name} label="Task Type" onChange={handleChange}>
          {groupSelects}
        </Select>
        {paramsSettings}
        <Button onClick={handleSubmit}>Set ACGs</Button>
      </FormControl>
    </Dialog>
  );
}

export default TaskDialogue;