import { useState } from "react";
import ImplantsPane from "./ImplantsPane";
import TasksPane from "./TasksPane";
import Grid from '@mui/material/Grid';

function MainPage() {
  const [selectedImplant, setSelectedImplant] = useState({id: "Implant"})

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TasksPane selectedImplant={selectedImplant}/>
      </Grid>
      <Grid item xs={6}>
        <ImplantsPane selectImplant={setSelectedImplant}/>
      </Grid>
    </Grid>
  )
}

export default MainPage;