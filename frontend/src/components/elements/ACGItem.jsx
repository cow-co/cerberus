import { IconButton, ListItem } from '@mui/material';
import Grid from '@mui/material/Grid';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const ACGItem = ({acg, deleteACG}) => {
  // TODO Open the confirmation dialogue when clicking delete
  return (
      <ListItem className={"listElement"} key={acg.name}>
        <Grid item xs={11}>
          <h4>{acg.name}</h4>
        </Grid>
        <Grid item xs={1}>
          <IconButton onClick={deleteACG}><DeleteForeverIcon /></IconButton>
        </Grid>
      </ListItem>
    )
}

export default ACGItem