import AlertsBar from "../elements/AlertsBar";
import ImplantsPane from "../elements/ImplantsPane";
import LoginDialogue from "../elements/LoginDialogue";
import RegisterDialogue from "../elements/RegisterDialogue";
import TasksPane from "../elements/TasksPane";
import { useState } from 'react';
import { Box, Grid, AppBar, Toolbar, Button, Typography } from '@mui/material';

// TODO Navbar
function MainPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleLoginFormOpen = () => {
    setLoginOpen(true);
  }

  const handleLoginFormClose = () => {
    setLoginOpen(false);
  }

  const handleLoginFormSubmit = async (data) => {
    
  }

  const handleRegisterFormOpen = () => {
    setRegisterOpen(true);
  }

  const handleRegisterFormClose = () => {
    setRegisterOpen(false);
  }

  const handleRegisterFormSubmit = async (data) => {
    
  }
  return (
    <Box sx={{flexGrow: 1}}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
            Cerberus
          </Typography>
          <Button onClick={handleRegisterFormOpen}>Register</Button>
          <Button onClick={handleLoginFormOpen}>Login</Button>
        </Toolbar>
      </AppBar>
      <LoginDialogue open={loginOpen} onClose={handleLoginFormClose} onSubmit={handleLoginFormSubmit} />
      <RegisterDialogue open={registerOpen} onClose={handleRegisterFormClose} onSubmit={handleRegisterFormSubmit} />
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