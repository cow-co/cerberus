import { ListItemButton } from '@mui/material';
import Grid from '@mui/material/Grid';

const ImplantItem = ({implant, chooseImplant}) => {
  const implantClass = (implant.isActive ? "implant active" : "implant inactive")
  return (
      <ListItemButton className={`listElement ${implantClass}`} key={implant.id} onClick={() => chooseImplant(implant)}>
        <Grid item xs={4}>
          <h4>IP: {implant.ip}</h4>
        </Grid>
        <Grid item xs={4}>
          <h4>OS: {implant.os}</h4>
        </Grid>
        <Grid item xs={4}>
          <h4>Beacon Interval: {implant.beaconIntervalSeconds} seconds</h4>
        </Grid>
      </ListItemButton>
    )
}

export default ImplantItem