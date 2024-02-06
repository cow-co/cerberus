import { useEffect } from 'react';
import { FormControl, MenuItem, Select, Dialog, DialogTitle, Button, ListItem, Grid, IconButton, List, Typography, InputLabel } from '@mui/material';
import { useSelector, useDispatch } from "react-redux";
import { createErrorAlert, createSuccessAlert } from '../../../common/redux/dispatchers';
import useWebSocket from 'react-use-websocket';
import { entityTypes, eventTypes } from "../../../common/web-sockets";
import conf from "../../../common/config/properties";
import { setGroups } from '../../../common/redux/groups-slice';
import { deleteUser, getGroups, changeAdminStatus } from "../../../common/apiCalls"
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { v4 as uuidv4 } from "uuid";
import { setMessage, setOpen, setSubmitAction } from "../../../common/redux/confirmation-slice";
import { EMPTY_USER } from '../../../common/utils';
import { setSelectedUser } from '../../../common/redux/users-slice';

const UserDialogue = ({open, onClose, onSubmit}) => {
  const groups = useSelector((state) => {
    return state.groups.groups
  });
  const selectedUser = useSelector((state) => {
    return state.users.selectedUser;
  });
  const dispatch = useDispatch();

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
    const userAcgs = selectedUser.acgs.map(acg => groups.find(group => group._id === acg));
    dispatch(setSelectedUser({
      id: selectedUser.id,
      name: selectedUser.name,
      isAdmin: selectedUser.isAdmin,
      acgs: userAcgs
    }));
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
    const { errors } = await changeAdminStatus(selectedUser.id, !selectedUser.isAdmin);
    if (errors.length > 0) {
      createErrorAlert(errors);
      dispatch(setSelectedUser(EMPTY_USER));
    } else {
      createSuccessAlert("Successfully changed user admin status");
      dispatch(setSelectedUser(EMPTY_USER));
    }
    onClose();
  }

  const handleAddGroup = () => {
    let updated = {
      id: selectedUser.id,
      name: selectedUser.name,
      isAdmin: selectedUser.isAdmin,
      acgs: selectedUser.acgs,
    };
    updated.acgs.push({internalId: uuidv4(), _id: "", name: ""});
    dispatch(setSelectedUser(updated));
  }
  
  const handleChooseGroup = (event) => {
    const {name, value} = event.target;

    let updated = {
      id: selectedUser.id,
      name: selectedUser.name,
      acgs: selectedUser.acgs,
      isAdmin: selectedUser.isAdmin
    };
    const selectedACG = groups.find(group => group.name === value);
    updated.acgs.forEach((acg) => {
      if (acg.internalId === name) {
        acg._id = selectedACG._id;
        acg.name = value;
      }
    });
    dispatch(setSelectedUser(updated));
  }

  const deleteGroup = (id) => {
    let updated = {
      id: selectedUser.id,
      name: selectedUser.name,
      acgs: selectedUser.acgs.filter(group => group.internalId !== id),
      isAdmin: selectedUser.isAdmin
    };
    dispatch(setSelectedUser(updated));
  }

  const handleSubmit = () => {
    onSubmit();
    onClose();
  }

  const handleDelete = async () => {
    const { errors } = await deleteUser();

    if (errors.length > 0) {
      createErrorAlert(errors);
    } else {
      createSuccessAlert("Successfully deleted user");
    }
    dispatch(setSelectedUser(EMPTY_USER));  
    dispatch(setOpen(false));
  }

  const handleConfirmOpen = () => { 
    dispatch(setMessage(`Delete User ${selectedUser.name}?`));
    dispatch(setSubmitAction(handleDelete));
    dispatch(setOpen(true));
    onClose();
  }

  const groupSelects = groups.map(group => {
    return <MenuItem value={group.name} key={group.internalId} id={group.internalId}>{group.name}</MenuItem>
  });
  
  const groupsSettings = selectedUser.acgs.map((acg) => (
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

  const adminButton = selectedUser.isAdmin 
    ? (<Button onClick={handleSubmitAdminStatus}>Unset User as Admin</Button>) 
    : (<Button onClick={handleSubmitAdminStatus}>Set User as Admin</Button>);

  return (
    <Dialog className="form-dialog" onClose={onClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>Update User {selectedUser.name}</DialogTitle>
      <FormControl fullWidth>
        <Typography variant="h6">Groups</Typography>
        <List>
          {groupsSettings}
        </List>
        <Button onClick={handleAddGroup}>Add Group</Button>
        <Button onClick={handleConfirmOpen}>Delete User</Button>
        {adminButton}
        <Button onClick={handleSubmit}>Save Changes</Button>
      </FormControl>
    </Dialog>
  );
}

export default UserDialogue;