import AlertsBar from "../elements/AlertsBar";
import ImplantsPane from "../elements/ImplantsPane";
import TasksPane from "../elements/TasksPane";
import Grid from '@mui/material/Grid';

// TODO The alerts stuff
function MainPage() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TasksPane />
      </Grid>
      <Grid item xs={6}>
        <ImplantsPane />
      </Grid>
      <Grid item xs={6}>
        <AlertsBar />
      </Grid>
    </Grid>
  )
}

export default MainPage;