import { List, ListItem } from '@mui/material';
import Container from '@mui/material/Container';

function ImplantsPane() {
  return (
    <Container fixed>
      <h2>Implants</h2>
      <List>
        <ListItem className='listElement'>
          <h4>Implant 1</h4>
        </ListItem>
        <ListItem className='listElement'>
          <h4>Implant 2</h4>
        </ListItem>
        <ListItem className='listElement'>
          <h4>Implant 3</h4>
        </ListItem>
      </List>
    </Container>
  )
}

export default ImplantsPane;