import AlertsBar from "../elements/common/AlertsBar";
import LoginDialogue from "../elements/access/LoginDialogue";
import RegisterDialogue from "../elements/access/RegisterDialogue";
import TaskTypesPane from "../elements/tasks/TaskTypesPane";
import { useState } from 'react';
import { Box, Grid } from '@mui/material';
import UsersPane from "../elements/users/UsersPane";
import ACGPane from "../elements/acg/ACGPane";
import HeaderBar from "../elements/common/HeaderBar";

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