import { useState, useEffect } from 'react';
import { InputLabel, FormControl, MenuItem, Select, Dialog, DialogTitle, Button, ListItem, Grid, IconButton } from '@mui/material';
import { useSelector, useDispatch } from "react-redux";
import { createErrorAlert } from '../../common/redux/dispatchers';
import useWebSocket from 'react-use-websocket';
import { entityTypes, eventTypes } from "../../common/web-sockets";
import conf from "../../common/config/properties";
import { setGroups } from '../../common/redux/groups-slice';
import { getGroups } from "../../common/apiCalls"
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

// FIXME UI for this is all borked
// FIXME None of the buttons work
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
      const groups = await getGroups();
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
  
  const handleAddROGroup = () => {
    let updated = {
      readOnlyACGs: acgs.readOnlyACGs,
      operatorACGs: acgs.operatorACGs
    };
    updated.readOnlyACGs.push({_id: "", name: ""});
    setACGs(updated);
  }
  
  const handleChooseROGroup = (event) => {
    const {name, value} = event.target;
    let updated = {
      readOnlyACGs: acgs.readOnlyACGs,
      operatorACGs: acgs.operatorACGs
    };
    updated.readOnlyACGs.forEach((acg) => {
      if (acg._id === name) {
        acg.name = value;
      }
    });
    setACGs(updated);
  }

  const deleteROGroup = (id) => {
    let updated = {
      readOnlyACGs: acgs.readOnlyACGs.filter(group => group._id === id),
      operatorACGs: acgs.operatorACGs
    };
    setACGs(updated);
  }
  
  const handleAddOpGroup = () => {
    let updated = {
      readOnlyACGs: acgs.readOnlyACGs,
      operatorACGs: acgs.operatorACGs
    };
    updated.operatorACGs.push({_id: "", name: ""});
    setACGs(updated);
  }
  
  const handleChooseOpGroup = (event) => {
    const {name, value} = event.target;
    let updated = {
      readOnlyACGs: acgs.readOnlyACGs,
      operatorACGs: acgs.operatorACGs
    };
    updated.operatorACGs.forEach((acg) => {
      if (acg._id === name) {
        acg.name = value;
      }
    });
    setACGs(updated);
  }

  const deleteOpGroup = (id) => {
    let updated = {
      readOnlyACGs: acgs.readOnlyACGs,
      operatorACGs: acgs.operatorACGs.filter(group => group._id === id)
    };
    setACGs(updated);
  }

  const handleClose = () => {
    setACGs({readOnlyACGs: [], operatorACGs: []});
    onClose();
  }

  const handleSubmit = () => {
    onSubmit(acgs);
  }

  const groupSelects = groups.map(group => {
    return <MenuItem value={group.name} key={group._id} id={group._id}>{group.name}</MenuItem>
  });
  
  const readGroupsSettings = acgs.readOnlyACGs.map((acg) => (
    <ListItem className="listElement" key={acg._id} >
      <Grid item xs={11}>
        <Select className="select-list" label="Group" value={acg.name} onChange={handleChooseROGroup} name={acg.name} id={acg._id}>
          {groupSelects}
        </Select>
      </Grid>
      <Grid item xs={1}>
        <IconButton onClick={() => deleteROGroup(acg._id)}><DeleteForeverIcon /></IconButton>
      </Grid>
    </ListItem>
  ));
  
  const operatorGroupsSettings = acgs.operatorACGs.map((acg) => (
    <ListItem className="listElement" key={acg._id} >
      <Grid item xs={11}>
        <Select className="select-list" label="Group" value={acg.name} onChange={handleChooseOpGroup} name={acg.name} id={acg._id}>
          {groupSelects}
        </Select>
      </Grid>
      <Grid item xs={1}>
        <IconButton onClick={() => deleteOpGroup(acg._id)}><DeleteForeverIcon /></IconButton>
      </Grid>
    </ListItem>
  ));

  return (
    <Dialog className="form-dialog" onClose={handleClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>Update Implant ACGs</DialogTitle>
      <FormControl fullWidth>
        <InputLabel id="task-type-label">Read-Only Groups</InputLabel>
        {readGroupsSettings}
        <Button onClick={handleAddROGroup}>Add Read-Only Group</Button>
        <InputLabel id="task-type-label">Operator Groups</InputLabel>
        {operatorGroupsSettings}
        <Button onClick={handleAddOpGroup}>Add Operator Group</Button>
        <Button onClick={handleSubmit}>Set ACGs</Button>
      </FormControl>
    </Dialog>
  );
}

export default ImplantACGDialogue;