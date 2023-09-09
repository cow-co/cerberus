import Button from '@mui/material/Button';
import { Checkbox, FormControlLabel, List } from '@mui/material';
import Container from '@mui/material/Container';
import { useState } from 'react';
import ImplantItem from '../elements/ImplantItem';

// TODO Make the list items into buttons, which populate the task list (placeholder for now)
// TODO Un-hardcode the backend url

const defaultImplants = [
  {
    implantId: "1",
    ip: "192.168.0.1",
    os: "Linux",
    beaconIntervalSeconds: 300,
    isActive: true
  },
  {
    implantId: "2",
    ip: "192.168.0.2",
    os: "Windows",
    beaconIntervalSeconds: 300,
    isActive: true
  },
  {
    implantId: "3",
    ip: "8.8.8.8",
    os: "BSD",
    beaconIntervalSeconds: 180,
    isActive: false
  }
];


const ImplantsPane = () => {
  // TODO Do we want the API to do the active/inactive filtering, or the frontend to do it?
  const [showInactive, setShowInactive] = useState(false);
  const [implants, setImplants] = useState(defaultImplants);



  const handleToggle = () => {
    setShowInactive(!showInactive)
  }

  const refresh = async () => {
    // TODO try/catch and error handling
    const response = await fetch("http://localhost:8080/api/implants?includeInactive=true")
    const receivedImplants = await response.json()
    console.log(receivedImplants)
    setImplants(receivedImplants)
  }

  let filtered = implants
  if(!showInactive) {
    filtered = implants.filter(implant => implant.isActive)
  }

  const implantsItems = filtered.map(implant => {
    return <ImplantItem implant={implant} />
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