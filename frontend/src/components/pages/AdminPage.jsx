import AlertsBar from "../elements/AlertsBar";
import LoginDialogue from "../elements/LoginDialogue";
import RegisterDialogue from "../elements/RegisterDialogue";
import TaskTypesPane from "../elements/TaskTypesPane";
import { useState } from 'react';
import { Box, Grid } from '@mui/material';
import AdminPane from "../elements/AdminPane";
import HeaderBar from "../elements/HeaderBar";

function AdminPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  console.log("Rendering Admin Page");

  return (
    <Box sx={{flexGrow: 1}}>
      <HeaderBar 
        handleAdminFormOpen={() => setAdminOpen(true)} 
        handleLoginFormOpen={() => setLoginOpen(true)} 
        handleRegisterFormOpen={() => setRegisterOpen(true)}
      />
      <LoginDialogue open={loginOpen} onClose={() => setLoginOpen(false)} />
      <RegisterDialogue open={registerOpen} onClose={() => setRegisterOpen(false)} />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TaskTypesPane />
        </Grid>
        <Grid item xs={6}>
          <AdminPane />
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

export default AdminPage;