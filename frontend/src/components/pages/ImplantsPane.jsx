import { List, ListItem } from '@mui/material';
import Container from '@mui/material/Container';

// TODO Layout the implant list items better
// TODO Colour the items according to if they are active or not
// TODO Make the list items into buttons, which populate the task list (placeholder for now)
// TODO "Show Inactive" radio button
// TODO Actually make the query the backend
// TODO "Refresh" button

const implants = [
  {
    implantId: "1",
    ip: "192.168.0.1",
    os: "Linux",
    beaconIntervalSeconds: 300,
    isActive: true
  }
]

function ImplantsPane() {
  console.log(implants)
  const implantsItems = implants.map(implant => {
    return (
      <ListItem className='listElement' key={implant.implantId}>
        <h4>{implant.ip}</h4>
        <h4>{implant.os}</h4>
        <h4>{implant.beaconIntervalSeconds}</h4>
      </ListItem>
    )
  })
  return (
    <Container fixed>
      <h2>Implants</h2>
      <List>
        {implantsItems}
      </List>
    </Container>
  )
}

export default ImplantsPane;