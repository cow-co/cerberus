import { Checkbox, FormControlLabel, List, ListItem } from '@mui/material';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { useState } from 'react';

// TODO Make the list items into buttons, which populate the task list (placeholder for now)
// TODO Actually make the query the backend
// TODO "Refresh" button

const implants = [
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


function ImplantsPane() {
  const [showInactive, setShowInactive] = useState(false);

  function handleToggle() {
    setShowInactive(!showInactive)
  }

  console.log("Rendering")
  let filtered = implants
  if(!showInactive) {
    filtered = implants.filter(implant => implant.isActive)
  }
  const implantsItems = filtered.map(implant => {
    const implantClass = (implant.isActive ? "implant active" : "implant inactive")
    return (
      <ListItem className={`listElement ${implantClass}`} key={implant.implantId}>
        <Grid item xs={4}>
          <h4>IP: {implant.ip}</h4>
        </Grid>
        <Grid item xs={4}>
          <h4>OS: {implant.os}</h4>
        </Grid>
        <Grid item xs={4}>
          <h4>Beacon Interval: {implant.beaconIntervalSeconds} seconds</h4>
        </Grid>
      </ListItem>
    )
  })
  return (
    <Container fixed>
      <h2>Implants</h2>
      <FormControlLabel control={<Checkbox checked={showInactive} onClick={handleToggle}/>} label="Show Inactive" />
      <List>
        {implantsItems}
      </List>
    </Container>
  )
}

export default ImplantsPane;