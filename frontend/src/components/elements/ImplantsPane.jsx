import Button from '@mui/material/Button';
import { Box, Checkbox, FormControlLabel, List, Typography } from '@mui/material';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import ImplantItem from './ImplantItem';
import { fetchImplants } from '../../common/apiCalls';
import { useSelector, useDispatch } from "react-redux";
import { setImplants, setSelectedImplant } from "../../common/redux/implants-slice";
import { createErrorAlert } from '../../common/redux/dispatchers';
import useWebSocket from 'react-use-websocket';
import { entityTypes } from "../../common/web-sockets";

const ImplantsPane = () => {
  const [showInactive, setShowInactive] = useState(false);
  const implants = useSelector((state) => state.implants.implants);
  const username = useSelector((state) => state.users.username);
  const dispatch = useDispatch();
  // TODO swap to using config for WS URL
  const { lastJsonMessage, readyState } = useWebSocket("ws://localhost:5000", {
    onOpen: () => {
      console.log("WebSocket opened");
    },
    share: true,  // This ensures we don't have a new connection for each component etc. 
    filter: (message) => {
      const event = JSON.parse(message);
      return event.entity === entityTypes.IMPLANTS;
    },
    retryOnError: true,
    shouldReconnect: () => true
  });

  const refresh = async () => {
    const result = await fetchImplants();
    if (result.errors.length === 0) {
      dispatch(setImplants(result.implants));
    } else {
      createErrorAlert(result.errors);
      dispatch(setImplants([]));
    }
  }

  useEffect(() => {
    async function callRefresh() {
      await refresh();
    }

    if (username) {
      callRefresh();
    }

    if (lastJsonMessage) {
      dispatch(setImplants(lastJsonMessage.data.implants));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, showInactive, lastJsonMessage]);

  const handleToggle = () => {
    setShowInactive(!showInactive);
  }

  // Handling the filtering on the client side
  // TODO Could probably maintain this in component-level state, and filter in the useEffect
  const filtered = implants.filter(implant => {
    if (showInactive) {
      return true;
    } else {
      return implant.isActive;
    }
  });

  const implantsItems = filtered.map(implant => {
    return <ImplantItem implant={implant} key={implant.id} chooseImplant={() => dispatch(setSelectedImplant(implant))}/>
  });

  // TODO Once websocket-updating is working, remove the Refresh button.
  return (
    <Container fixed>
      <Typography align="center" variant="h3">Implants</Typography>
      <Box display="flex" justifyContent="center" alignItems="center">
        <FormControlLabel control={<Checkbox checked={showInactive} onClick={handleToggle}/>} label="Show Inactive" />
        <Button variant='contained' onClick={refresh}>Refresh</Button>
      </Box>
      <List>
        {implantsItems}
      </List>
    </Container>
  );
}

export default ImplantsPane;