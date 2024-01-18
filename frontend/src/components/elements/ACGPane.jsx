import { Button, List, Typography } from '@mui/material';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import ACGItem from './ACGItem';
import { createGroup, deleteGroup, getGroups } from '../../common/apiCalls';
import { setGroups } from "../../common/redux/groups-slice";
import CreateACGDialogue from './CreateACGDialogue';
import { useSelector, useDispatch } from "react-redux";
import { createErrorAlert, createSuccessAlert } from '../../common/redux/dispatchers';
import useWebSocket from 'react-use-websocket';
import { entityTypes, eventTypes } from "../../common/web-sockets";
import conf from "../../common/config/properties";

function ACGPane() {
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const acgs = useSelector((state) => state.groups.groups);
  const dispatch = useDispatch();

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
    async function callFetcher() {
      const json = await getGroups();
      if (json.errors.length > 0) {
        dispatch(setGroups(json.groups));
      } else {
        createErrorAlert(json.errors);
      }
    }
    callFetcher()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (lastJsonMessage) {
      let updated = [...acgs];

      switch (lastJsonMessage.eventType) {
        case eventTypes.CREATE:
          updated.push(lastJsonMessage.entity);
          break;
        case eventTypes.DELETE:
          updated = updated.filter(acg => acg._id !== lastJsonMessage.entity._id);
          break;
        default:
          break;
      }

      dispatch(setGroups(updated));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);

  const handleFormOpen = () => {
    setDialogueOpen(true);
  }

  const handleFormClose = () => {
    setDialogueOpen(false);
  }

  const handleFormSubmit = async (data) => {
    const response = await createGroup(data);
    if (response.errors.length > 0) {
      createErrorAlert(response.errors);
    } else {
      handleFormClose();
      createSuccessAlert("Successfully created ACG");
    }
  }

  const handleDelete = async (acg) => {
    const { errors } = await deleteGroup(acg._id);

    if (errors.length > 0) {
      createErrorAlert(errors);
    } else {
      createSuccessAlert("Successfully deleted ACG");
    }

  }

  let acgsItems = null;

  if (acgs !== undefined && acgs !== null) {
    acgsItems = acgs.map(acg => {
      return <ACGItem acg={acg} key={acg._id} deleteACG={() => handleDelete(acg)} />
    });
  }

  // TODO Needs a refresh button, so that AD auth groups can be refreshed (DB auth ones are websocketed)
  return (
    <Container fixed>
      <Typography align="center" variant="h3">Access Control Groups</Typography>
      <Button variant='contained' onClick={handleFormOpen}>Create Access Control Group</Button>
      <List>
        {acgsItems}
      </List>
      <CreateACGDialogue open={dialogueOpen} onClose={handleFormClose} onSubmit={handleFormSubmit} />
    </Container>
      
  )
}

export default ACGPane;