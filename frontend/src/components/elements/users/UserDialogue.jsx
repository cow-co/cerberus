import { useState, useEffect } from 'react';
import { FormControl, MenuItem, Select, Dialog, DialogTitle, Button, ListItem, Grid, IconButton, List, Typography, InputLabel } from '@mui/material';
import { useSelector, useDispatch } from "react-redux";
import { createErrorAlert } from '../../../common/redux/dispatchers';
import useWebSocket from 'react-use-websocket';
import { entityTypes, eventTypes } from "../../../common/web-sockets";
import conf from "../../../common/config/properties";
import { setGroups } from '../../../common/redux/groups-slice';
import { deleteUser, getGroups } from "../../../common/apiCalls"
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { v4 as uuidv4 } from "uuid";
import { EMPTY_USER } from '../../../common/utils';
import { setSelectedUser } from '../../../common/redux/users-slice';

const UserDialogue = ({open, onClose, onSubmit, providedUser}) => {
  const groups = useSelector((state) => {
    return state.groups.groups
  });
  const dispatch = useDispatch();
  const [user, setUser] = useState(EMPTY_USER);

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
    const userAcgs = providedUser.acgs.map(acg => groups.find(group => group._id === acg));
    setUser({
      id: providedUser.id,
      name: providedUser.name,
      isAdmin: providedUser.isAdmin,
      acgs: userAcgs
    });
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

  const handleSubmitAdminStatus = async () => {
    const { errors } = await changeAdminStatus(user.id, !user.isAdmin); // TODO Pull the new admin status as !user.isAdmin
    if (errors.length > 0) {
      createErrorAlert(errors);
      setUser(EMPTY_USER);
    } else {
      createSuccessAlert("Successfully changed user admin status");
      setUser(EMPTY_USER);
    }
  }

  const handleAddGroup = () => {
    let updated = {
      id: user.id,
      name: user.name,
      isAdmin: user.isAdmin,
      acgs: user.acgs,
    };
    updated.acgs.push({internalId: uuidv4(), _id: "", name: ""});
    setUser(updated);
  }
  
  const handleChooseGroup = (event) => {
    const {name, value} = event.target;

    let updated = {
      id: user.id,
      name: user.name,
      acgs: user.acgs,
    };
    const selectedACG = groups.find(group => group.name === value);
    updated.acgs.forEach((acg) => {
      if (acg.internalId === name) {
        acg._id = selectedACG._id;
        acg.name = value;
      }
    });
    setUser(updated);
  }

  const deleteGroup = (id) => {
    let updated = {
      id: user.id,
      name: user.name,
      acgs: user.acgs.filter(group => group.internalId !== id),
    };
    setUser(updated);
  }

  const handleClose = () => {
    onClose();
  }

  const handleSubmit = () => {
    onSubmit(user);
  }

  const handleDelete = async () => {
    const { errors } = await deleteUser();

    if (errors.length > 0) {
      createErrorAlert(errors);
    } else {
      await loadTaskTypes();
      createSuccessAlert("Successfully deleted user");
    }
    dispatch(setSelectedTaskType(EMPTY_USER));
    dispatch(setOpen(false));
  }

  const handleConfirmOpen = (user) => {
    dispatch(setSelectedUser(user));  
    dispatch(setMessage(`Delete User ${user.name}?`));
    dispatch(setSubmitAction(handleDelete));
    dispatch(setOpen(true));
  }

  const groupSelects = groups.map(group => {
    return <MenuItem value={group.name} key={group.internalId} id={group.internalId}>{group.name}</MenuItem>
  });
  
  const groupsSettings = user.acgs.map((acg) => (
    <ListItem className="listElement" key={acg.internalId} >
      <Grid item xs={11}>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="group-label">Group</InputLabel>
          <Select className="select-list" label="Group" labelId="group-label" value={acg.name} onChange={handleChooseGroup} name={acg.internalId} id={acg._id}>
            {groupSelects}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={1}>
        <IconButton onClick={() => deleteGroup(acg.internalId)}><DeleteForeverIcon /></IconButton>
      </Grid>
    </ListItem>
  ));

  const adminButton = user.isAdmin 
    ? (<Button onClick={handleSubmitAdminStatus}>Unset User as Admin</Button>) 
    : (<Button onClick={handleSubmitAdminStatus}>Set User as Admin</Button>);

  return (
    <Dialog className="form-dialog" onClose={handleClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>Update User {user.name}</DialogTitle>
      <FormControl fullWidth>
        <Typography variant="h6">Groups</Typography>
        <List>
          {groupsSettings}
        </List>
        <Button onClick={handleAddGroup}>Add Group</Button>
        <Button onClick={() => handleConfirmOpen(user)}>Delete User</Button>
        {adminButton}
        <Button onClick={handleSubmit}>Save Changes</Button>
      </FormControl>
    </Dialog>
  );
}

export default UserDialogue;