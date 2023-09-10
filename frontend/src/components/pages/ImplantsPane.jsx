import Button from '@mui/material/Button';
import { Checkbox, FormControlLabel, List } from '@mui/material';
import Container from '@mui/material/Container';
import { useState } from 'react';
import ImplantItem from '../elements/ImplantItem';

const ImplantsPane = ({selectImplant}) => {
  console.log("Rendering implants")
  const [showInactive, setShowInactive] = useState(false);
  const [implants, setImplants] = useState([]);

  const handleToggle = () => {
    setShowInactive(!showInactive)
  }

  const refresh = async () => {
    // TODO try/catch and error handling
    // TODO Make the backend URL configurable
    const response = await fetch("http://localhost:5000/api/implants")
    const json = await response.json()
    setImplants(json.implants.filter(implant => implant.isActive))
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