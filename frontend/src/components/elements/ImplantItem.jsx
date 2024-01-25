import { ListItem, IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useSelector } from "react-redux";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

const ImplantItem = ({implant, chooseImplant, deleteImplant}) => {
  const isAdmin = useSelector((state) => state.users.isAdmin);
  const implantClass = (implant.isActive ? "implant active" : "implant inactive");

  let deleteButton = null;
  if (isAdmin) {
    deleteButton = <IconButton onClick={deleteImplant}><DeleteForeverIcon /></IconButton>
  }

  // TODO Allow admins to add ACGs to implant
  return (
      <ListItem className={`listElement ${implantClass}`} key={implant.id}>
        <Grid item xs={4}>
          <h4>IP: {implant.ip}</h4>
        </Grid>
        <Grid item xs={3}>
          <h4>OS: {implant.os}</h4>
        </Grid>
        <Grid item xs={3}>
          <h4>Beacon Interval: {implant.beaconIntervalSeconds} seconds</h4>
        </Grid>
        <Grid item xs={1}>
          <IconButton onClick={() => chooseImplant(implant)}><AssignmentTurnedInIcon /></IconButton>
        </Grid>
        <Grid item xs={1}>
          {deleteButton}
        </Grid>
      </ListItem>
    );
}

export default ImplantItem;