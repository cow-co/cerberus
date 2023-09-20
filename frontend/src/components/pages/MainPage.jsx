import AlertsBar from "../elements/AlertsBar";
import ImplantsPane from "../elements/ImplantsPane";
import TasksPane from "../elements/TasksPane";
import { Box, Grid } from '@mui/material';

function MainPage() {
  // TODO Better alerts formatting
  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TasksPane />
      </Grid>
      <Grid item xs={6}>
        <ImplantsPane />
      </Grid>
      <Grid item xs={12}>
        <Box display="flex" justifyContent="center" alignItems="center">
          <AlertsBar />
        </Box>
      </Grid>
    </Grid>
  )
}

export default MainPage;