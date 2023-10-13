import AlertsBar from "../elements/AlertsBar";
import LoginDialogue from "../elements/LoginDialogue";
import RegisterDialogue from "../elements/RegisterDialogue";
import TaskTypesPane from "../elements/TaskTypesPane";
import { useState } from 'react';
import { Box, Grid } from '@mui/material';
import AdminDialogue from "../elements/AdminDialogue";
import HeaderBar from "../elements/HeaderBar";

function TaskTypesPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  console.log("Rendering Task Types Page");

  return (
    <Box sx={{flexGrow: 1}}>
      <HeaderBar 
        handleAdminFormOpen={() => setAdminOpen(true)} 
        handleLoginFormOpen={() => setLoginOpen(true)} 
        handleRegisterFormOpen={() => setRegisterOpen(true)}
      />
      <LoginDialogue open={loginOpen} onClose={() => setLoginOpen(false)} />
      <RegisterDialogue open={registerOpen} onClose={() => setRegisterOpen(false)} />
      <AdminDialogue open={adminOpen} onClose={() => setAdminOpen(false)} />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TaskTypesPane />
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

export default TaskTypesPage;