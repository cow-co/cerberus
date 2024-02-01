import { useState, useEffect } from 'react';
import { FormControl, MenuItem, Select, Dialog, DialogTitle, Button, ListItem, Grid, IconButton, List, Typography, InputLabel } from '@mui/material';
import { useSelector, useDispatch } from "react-redux";
import { createErrorAlert } from '../../../common/redux/dispatchers';
import useWebSocket from 'react-use-websocket';
import { entityTypes, eventTypes } from "../../../common/web-sockets";
import conf from "../../../common/config/properties";
import { setGroups } from '../../../common/redux/groups-slice';
import { getGroups } from "../../../common/apiCalls"
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { v4 as uuidv4 } from "uuid";

// FIXME First time opening this after a login, results in an undefined-error (acg(s) undefined?)
//  Fine after that, however.
const ImplantACGDialogue = ({open, onClose, onSubmit}) => {
  const groups = useSelector((state) => {
    return state.groups.groups
  });
  const selectedImplant = useSelector((state) => {
    return state.implants.selected
  });
  const dispatch = useDispatch();
  const [acgs, setACGs] = useState({readOnlyACGs: [], operatorACGs: []});

  const { lastJsonMessage } = useWebSocket(conf.wsURL, {
    onOpen: () => {
      
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
    const ro = selectedImplant.readOnlyACGs.map(acg => groups.find(group => group._id === acg));
    const op = selectedImplant.operatorACGs.map(acg => groups.find(group => group._id === acg));
    setACGs({
      readOnlyACGs: ro,
      operatorACGs: op
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ro = selectedImplant.readOnlyACGs.map(acg => groups.find(group => group._id === acg));
    const op = selectedImplant.operatorACGs.map(acg => groups.find(group => group._id === acg));
    setACGs({
      readOnlyACGs: ro,
      operatorACGs: op
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImplant]);

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
      readOnlyACGs: [...acgs.readOnlyACGs],
      operatorACGs: [...acgs.operatorACGs]
    };
    updated.readOnlyACGs.push({internalId: uuidv4(), _id: "", name: ""});
    setACGs(updated);
  }
  
  // FIXME the select-input-label in a slightly iffy place
  const handleChooseROGroup = (event) => {
    const {name, value} = event.target;

    let updated = {
      readOnlyACGs: [...acgs.readOnlyACGs],
      operatorACGs: [...acgs.operatorACGs]
    };
    const selectedACG = groups.find(group => group.name === value);
    updated.readOnlyACGs.forEach((acg) => {
      if (acg.internalId === name) {
        acg._id = selectedACG._id;
        acg.name = value;
      }
    });
    setACGs(updated);
  }

  const deleteROGroup = (id) => {
    let updated = {
      readOnlyACGs: acgs.readOnlyACGs.filter(group => group.internalId !== id),
      operatorACGs: acgs.operatorACGs
    };
    setACGs(updated);
  }
  
  const handleAddOpGroup = () => {
    let updated = {
      readOnlyACGs: [...acgs.readOnlyACGs],
      operatorACGs: [...acgs.operatorACGs]
    };
    updated.operatorACGs.push({internalId: uuidv4(), _id: "", name: ""});
    setACGs(updated);
  }
  // FIXME the select-input-label in a slightly iffy place
  // FIXME the ACGs don't load until go into admin page - move that to the implant-pane load?
  const handleChooseOpGroup = (event) => {
    const {name, value} = event.target;
    let updated = {
      readOnlyACGs: [...acgs.readOnlyACGs],
      operatorACGs: [...acgs.operatorACGs]
    };
    const selectedACG = groups.find(group => group.name === value);
    updated.operatorACGs.forEach((acg) => {
      if (acg.internalId === name) {
        acg._id = selectedACG._id;
        acg.name = value;
      }
    });
    setACGs(updated);
  }

  const deleteOpGroup = (id) => {
    let updated = {
      readOnlyACGs: acgs.readOnlyACGs,
      operatorACGs: acgs.operatorACGs.filter(group => group.internalId !== id)
    };
    setACGs(updated);
  }

  const handleClose = () => {
    onClose();
  }

  const handleSubmit = () => {
    onSubmit(acgs);
  }

  const roGroupSelects = groups.map(group => {
    return <MenuItem value={group.name} key={group.internalId} id={group.internalId}>{group.name}</MenuItem>
  });

  const opGroupSelects = groups.map(group => {
    return <MenuItem value={group.name} key={group.internalId} id={group.internalId}>{group.name}</MenuItem>
  });
  
  const readGroupsSettings = acgs.readOnlyACGs.map((acg) => (
    <ListItem className="listElement" key={acg.internalId} >
      <Grid item xs={11}>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="ro-group-label">Group</InputLabel>
          <Select className="select-list" label="Group" labelId="ro-group-label" value={acg.name} onChange={handleChooseROGroup} name={acg.internalId} id={acg._id}>
            {roGroupSelects}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={1}>
        <IconButton onClick={() => deleteROGroup(acg.internalId)}><DeleteForeverIcon /></IconButton>
      </Grid>
    </ListItem>
  ));
  
  const operatorGroupsSettings = acgs.operatorACGs.map((acg) => (
    <ListItem className="listElement" key={acg.internalId} >
      <Grid item xs={11}>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="op-group-label">Group</InputLabel>
          <Select className="select-list" label="Group" labelId="op-group-label" value={acg.name} onChange={handleChooseOpGroup} name={acg.internalId} id={acg._id}>
            {opGroupSelects}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={1}>
        <IconButton onClick={() => deleteOpGroup(acg.internalId)}><DeleteForeverIcon /></IconButton>
      </Grid>
    </ListItem>
  ));

  return (
    <Dialog className="form-dialog" onClose={handleClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>Update Implant ACGs</DialogTitle>
      <FormControl fullWidth>
        <Typography variant="h6">Read-Only Groups</Typography>
        <List>
          {readGroupsSettings}
        </List>
        <Typography variant="h6">Operator Groups</Typography>
        <List>
          {operatorGroupsSettings}
        </List>
        <Button onClick={handleAddROGroup}>Add Read-Only Group</Button>
        <Button onClick={handleAddOpGroup}>Add Operator Group</Button>
        <Button onClick={handleSubmit}>Set ACGs</Button>
      </FormControl>
    </Dialog>
  );
}

export default ImplantACGDialogue;