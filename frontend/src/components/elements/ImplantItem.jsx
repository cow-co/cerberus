import { ListItemButton, IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useSelector } from "react-redux";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const ImplantItem = ({implant, chooseImplant, deleteImplant}) => {
  const isAdmin = useSelector((state) => state.users.isAdmin);
  const implantClass = (implant.isActive ? "implant active" : "implant inactive");

  let deleteButton = null;
  if (isAdmin) {
    deleteButton = <IconButton onClick={deleteImplant}><DeleteForeverIcon /></IconButton>
  }

  return (
      <ListItemButton className={`listElement ${implantClass}`} key={implant.id} onClick={() => chooseImplant(implant)}>
        <Grid item xs={4}>
          <h4>IP: {implant.ip}</h4>
        </Grid>
        <Grid item xs={4}>
          <h4>OS: {implant.os}</h4>
        </Grid>
        <Grid item xs={3}>
          <h4>Beacon Interval: {implant.beaconIntervalSeconds} seconds</h4>
        </Grid>
        <Grid item xs={1}>
          {deleteButton}
        </Grid>
      </ListItemButton>
    );
}

export default ImplantItem;