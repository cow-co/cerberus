import Button from '@mui/material/Button';
import { Box, Checkbox, FormControlLabel, List, Typography } from '@mui/material';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import ImplantItem from './ImplantItem';
import { fetchImplants } from '../../common/apiCalls';
import { useSelector, useDispatch } from "react-redux";
import { setImplants, setSelectedImplant } from "../../common/redux/implants-slice";
import { createErrorAlert } from '../../common/redux/dispatchers';

const ImplantsPane = () => {
  const [showInactive, setShowInactive] = useState(false);
  const implants = useSelector((state) => state.implants.implants);
  const username = useSelector((state) => state.users.username);
  const dispatch = useDispatch();

  const handleToggle = () => {
    setShowInactive(!showInactive);
  }

  const refresh = async () => {
    const result = await fetchImplants();
    if (result.errors.length === 0) {
      if (showInactive) {
        dispatch(setImplants(result.implants));
      } else {
        const filtered = result.implants.filter(implant => implant.isActive);
        dispatch(setImplants(filtered));
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  const implantsItems = implants.map(implant => {
    return <ImplantItem implant={implant} key={implant.id} chooseImplant={() => dispatch(setSelectedImplant(implant))}/>
  });

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