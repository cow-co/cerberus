import { ListItem, IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useSelector } from "react-redux";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import LockIcon from '@mui/icons-material/Lock';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

const ImplantItem = ({implant, chooseImplant, editACGs, deleteImplant}) => {
  const isAdmin = useSelector((state) => state.users.isAdmin);
  const implantClass = (implant.isActive ? "implant active" : "implant inactive");

  let deleteButton = null;
  let acgButton = null;
  if (isAdmin) {
    deleteButton = <IconButton onClick={deleteImplant}><DeleteForeverIcon /></IconButton>
    acgButton = <IconButton onClick={editACGs}><LockIcon /></IconButton>
  }

  return (
      <ListItem className={`listElement ${implantClass}`} key={implant.id}>
        <Grid item xs={3}>
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
          {acgButton}
        </Grid>
        <Grid item xs={1}>
          {deleteButton}
        </Grid>
      </ListItem>
    );
}

export default ImplantItem;