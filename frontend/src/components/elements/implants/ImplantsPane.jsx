import { Box, Checkbox, FormControlLabel, List, Typography } from '@mui/material';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import ImplantItem from './ImplantItem';
import ImplantACGDialogue from './ImplantACGDialogue';
import { deleteImplant, fetchImplants, editACGs } from '../../../common/apiCalls';
import { useSelector, useDispatch } from "react-redux";
import { setSelectedImplant } from "../../../common/redux/implants-slice";
import { setMessage, setOpen, setSubmitAction } from "../../../common/redux/confirmation-slice";
import { createErrorAlert, createSuccessAlert } from '../../../common/redux/dispatchers';
import useWebSocket from 'react-use-websocket';
import { entityTypes, eventTypes } from "../../../common/web-sockets";
import conf from "../../../common/config/properties";
import { EMPTY_IMPLANT } from '../../../common/utils';

const ImplantsPane = () => {
  const [showInactive, setShowInactive] = useState(false);
  const [hasLoggedIn, setHasLoggedIn] = useState(false);
  const [acgEditOpen, setACGEditOpen] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const [implants, setImplants] = useState([]);

  const selectedImplant = useSelector((state) => state.implants.selected);
  const username = useSelector((state) => state.users.username);
  const dispatch = useDispatch();

  const { lastJsonMessage } = useWebSocket(conf.wsURL, {
    onOpen: () => {
      
    },
    share: true,  // This ensures we don't have a new connection for each component etc. 
    filter: (message) => {
      const data = JSON.parse(message.data);
      return data.entityType === entityTypes.IMPLANTS;
    },
    retryOnError: true,
    shouldReconnect: () => true
  });

  const refresh = async () => {
    const result = await fetchImplants();
    if (result.errors.length === 0) {
      setImplants(result.implants);
    } else {
      createErrorAlert(result.errors);
      setImplants([]);
    }
  }

  useEffect(() => {
    async function callRefresh() {
      await refresh();
    }

    if (username && !hasLoggedIn) {
      callRefresh();
      setHasLoggedIn(true);
    } else if (!username && hasLoggedIn) {
      setImplants([]);
      dispatch(setSelectedImplant(EMPTY_IMPLANT))
      setHasLoggedIn(false);
    }

    setFiltered(implants.filter(implant => {
      if (showInactive) {
        return true;
      } else {
        return implant.isActive;
      }
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, showInactive, implants]);

  // Splitting this out ensures we don't dispatch redux updates unless 
  // a websocket message has actually arrived
  useEffect(() => {
    if (lastJsonMessage) {
      let updated = [...implants];

      switch (lastJsonMessage.eventType) {
        case eventTypes.CREATE:
          updated.push(lastJsonMessage.entity);
          break;
        case eventTypes.EDIT:
          updated = updated.map(implant => {
            if (implant.id === lastJsonMessage.entity.id) {
              return lastJsonMessage.entity;
            } else {
              return implant;
            }
          });
          break;
        case eventTypes.DELETE:
          updated = updated.filter(implant => implant.id !== lastJsonMessage.entity.id);
          break;
        default:
          break;
      }
      
      setImplants(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);

  const handleToggle = () => {
    setShowInactive(!showInactive);
  }

  const removeImplant = async () => {
    const res = await deleteImplant();
    if (res.errors.length > 0) {
      createErrorAlert(res.errors);
    } else {
      createSuccessAlert("Successfully deleted implant");
    }
    dispatch(setSelectedImplant(EMPTY_IMPLANT))
    dispatch(setOpen(false));
  }

  const openConfirmation = (implant) => {
    dispatch(setSelectedImplant(implant));
    dispatch(setMessage(`Delete Implant ${implant.id}?`));
    dispatch(setSubmitAction(removeImplant));
    dispatch(setOpen(true));
  }

  const openACGs = (implant) => {
    dispatch(setSelectedImplant(implant));
    setACGEditOpen(true);
  }

  const submitACGs = async (acgs) => {
    const response = await editACGs(selectedImplant.id, acgs);
    if (response.errors.length > 0) {
      createErrorAlert(response.errors);
    } else {
      dispatch(setSelectedImplant(EMPTY_IMPLANT));
      setACGEditOpen(false);
      await refresh();
      createSuccessAlert("Successfully updated groups");
    }
  }

  const implantsItems = filtered.map(implant => {
    return <ImplantItem implant={implant} key={implant.id} chooseImplant={() => dispatch(setSelectedImplant(implant))} editACGs={() => openACGs(implant)} deleteImplant={() => openConfirmation(implant)} />
  });

  return (
    <Container fixed>
      <Typography align="center" variant="h3">Implants</Typography>
      <Box display="flex" justifyContent="center" alignItems="center">
        <FormControlLabel control={<Checkbox checked={showInactive} onClick={handleToggle}/>} label="Show Inactive" />
      </Box>
      <List>
        {implantsItems}
      </List>
      <ImplantACGDialogue open={acgEditOpen} onClose={ () => setACGEditOpen(false) } onSubmit={submitACGs} />
    </Container>
  );
}

export default ImplantsPane;