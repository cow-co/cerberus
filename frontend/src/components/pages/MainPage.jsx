import AlertsBar from "../elements/AlertsBar";
import ImplantsPane from "../elements/implants/ImplantsPane";
import LoginDialogue from "../elements/user-management/LoginDialogue";
import RegisterDialogue from "../elements/user-management/RegisterDialogue";
import TasksPane from "../elements/tasks/TasksPane";
import { useState } from 'react';
import { Box, Grid } from '@mui/material';
import HeaderBar from "../elements/HeaderBar";

function MainPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <Box sx={{flexGrow: 1}}>
      <HeaderBar 
        handleLoginFormOpen={() => setLoginOpen(true)} 
        handleRegisterFormOpen={() => setRegisterOpen(true)}
      />
      <LoginDialogue open={loginOpen} onClose={() => setLoginOpen(false)} />
      <RegisterDialogue open={registerOpen} onClose={() => setRegisterOpen(false)} />
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
    </Box>
  )
}

export default MainPage;