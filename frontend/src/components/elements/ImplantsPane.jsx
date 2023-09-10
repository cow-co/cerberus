import Button from '@mui/material/Button';
import { Checkbox, FormControlLabel, List } from '@mui/material';
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

  const refresh = async () => {
    setImplants(await fetchImplants(showInactive))
  }

  const implantsItems = implants.map(implant => {
    return <ImplantItem implant={implant} key={implant.id} chooseImplant={selectImplant}/>
  })

  return (
    <Container fixed>
      <h2>Implants</h2>
      <Button variant='contained' onClick={refresh}>Refresh</Button>
      <FormControlLabel control={<Checkbox checked={showInactive} onClick={handleToggle}/>} label="Show Inactive" />
      <List>
        {implantsItems}
      </List>
    </Container>
  )
}

export default ImplantsPane;