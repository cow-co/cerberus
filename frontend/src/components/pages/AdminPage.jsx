import AlertsBar from "../elements/AlertsBar";
import LoginDialogue from "../elements/LoginDialogue";
import RegisterDialogue from "../elements/RegisterDialogue";
import TaskTypesPane from "../elements/TaskTypesPane";
import { useState } from 'react';
import { Box, Grid } from '@mui/material';
import UsersPane from "../elements/UsersPane";
import ACGPane from "../elements/ACGPane";
import HeaderBar from "../elements/HeaderBar";

function AdminPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <>
      <Box sx={{flexGrow: 1}}>
        <HeaderBar 
          handleLoginFormOpen={() => setLoginOpen(true)} 
          handleRegisterFormOpen={() => setRegisterOpen(true)}
        />
        <LoginDialogue open={loginOpen} onClose={() => setLoginOpen(false)} />
        <RegisterDialogue open={registerOpen} onClose={() => setRegisterOpen(false)} />
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TaskTypesPane />
          </Grid>
          <Grid item xs={4}>
            <UsersPane />
          </Grid>
          <Grid>
            <ACGPane />
          </Grid>
        </Grid>
      </Box>
      <AlertsBar />
    </>
  )
}

export default AdminPage;