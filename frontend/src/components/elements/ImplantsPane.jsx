import Button from '@mui/material/Button';
import { Box, Checkbox, FormControlLabel, List, Typography } from '@mui/material';
import Container from '@mui/material/Container';
import { useState } from 'react';
import ImplantItem from './ImplantItem';
import { fetchImplants } from '../../functions/apiCalls';

const ImplantsPane = ({selectImplant}) => {
  console.log("Rendering implants")
  const [showInactive, setShowInactive] = useState(false);
  const [implants, setImplants] = useState([]);

  const handleToggle = () => {
    setShowInactive(!showInactive)
  }

  // TODO do this on page-load as well
  const refresh = async () => {
    const result = await fetchImplants();
    if (result.errors.length === 0) {
      if (showInactive) {
        setImplants(result.implants)
      } else {
        const filtered = result.implants.filter(implant => implant.isActive)
        setImplants(filtered)
      }
    } else {
      alert(errors[0])
    }
  }

  const implantsItems = implants.map(implant => {
    return <ImplantItem implant={implant} key={implant.id} chooseImplant={selectImplant}/>
  })

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
  )
}

export default ImplantsPane;