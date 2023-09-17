import { useState } from "react";
import ImplantsPane from "../elements/ImplantsPane";
import TasksPane from "../elements/TasksPane";
import Grid from '@mui/material/Grid';

function MainPage() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TasksPane />
      </Grid>
      <Grid item xs={6}>
        <ImplantsPane />
      </Grid>
    </Grid>
  )
}

export default MainPage;