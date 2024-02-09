import AlertsBar from "../elements/common/AlertsBar";
import ImplantsPane from "../elements/implants/ImplantsPane";
import LoginDialogue from "../elements/access/LoginDialogue";
import RegisterDialogue from "../elements/access/RegisterDialogue";
import PasswordChangeDialogue from "../elements/users/PasswordChangeDialogue";
import TasksPane from "../elements/tasks/TasksPane";
import { useState } from 'react';
import { Box, Grid } from '@mui/material';
import HeaderBar from "../elements/common/HeaderBar";
import ConfirmationDialogue from "../elements/common/ConfirmationDialogue";

function MainPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [pwChangeOpen, setPWChangeOpen] = useState(false);

  return (
    <>
      <Box sx={{flexGrow: 1}}>
        <HeaderBar 
          handleLoginFormOpen={() => setLoginOpen(true)} 
          handleRegisterFormOpen={() => setRegisterOpen(true)}
          handlePWChangeOpen={() => setPWChangeOpen(true)}
        />
        <LoginDialogue open={loginOpen} onClose={() => setLoginOpen(false)} />
        <RegisterDialogue open={registerOpen} onClose={() => setRegisterOpen(false)} />
        <PasswordChangeDialogue open={pwChangeOpen} onClose={() => setPWChangeOpen(false)} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TasksPane />
          </Grid>
          <Grid item xs={6}>
            <ImplantsPane />
          </Grid>
        </Grid>
      </Box>
      <AlertsBar />
      <ConfirmationDialogue />
    </>
  )
}

export default MainPage;