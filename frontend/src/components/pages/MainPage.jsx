import AlertsBar from "../elements/AlertsBar";
import ImplantsPane from "../elements/ImplantsPane";
import LoginDialogue from "../elements/LoginDialogue";
import RegisterDialogue from "../elements/RegisterDialogue";
import TasksPane from "../elements/TasksPane";
import { useState } from 'react';
import { Box, Grid, AppBar, Toolbar, Button, Typography } from '@mui/material';
import { logout } from "../../functions/apiCalls";
import { useSelector, useDispatch } from "react-redux";
import { setUsername } from "../../common/redux/users-slice";
import conf from "../../common/config/properties";
import { addAlert, removeAlert } from "../../common/redux/alerts-slice";
import { generateAlert } from "../../common/utils";
import AdminDialogue from "../elements/AdminDialogue";

function MainPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const loggedInUser = useSelector((state) => state.users.username);
  const dispatch = useDispatch();

  const handleLoginFormOpen = () => {
    setLoginOpen(true);
  }

  const handleLoginFormClose = () => {
    setLoginOpen(false);
  }

  const handleAdminFormOpen = () => {
    setAdminOpen(true);
  }

  const handleAdminFormClose = () => {
    setAdminOpen(false);
  }

  const handleRegisterFormOpen = () => {
    setRegisterOpen(true);
  }

  const handleRegisterFormClose = () => {
    setRegisterOpen(false);
  }
  

  const handleLogout = async () => {
    const errors = await logout();
    if (errors.length > 0) {
      errors.forEach((error) => {
        const alert = generateAlert(error, "error");
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(alert.id)), conf.alertsTimeout);
      });
    } else {
        const alert = generateAlert("Successfully logged out", "success");
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(alert.id)), conf.alertsTimeout);
        dispatch(setUsername(""));
        handleRegisterFormClose();
    }
  }

  let loginoutButton = null;
  if (!loggedInUser) {
    loginoutButton = <Button onClick={handleLoginFormOpen}>Log In</Button>
  } else {
    loginoutButton = <Button onClick={handleLogout}>Log Out</Button>
  }

  return (
    <Box sx={{flexGrow: 1}}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
            Cerberus
          </Typography>
          <Button onClick={handleRegisterFormOpen}>Register</Button>
          {loginoutButton}
          <Button onClick={handleAdminFormOpen}>Admin</Button>
        </Toolbar>
      </AppBar>
      <LoginDialogue open={loginOpen} onClose={handleLoginFormClose} />
      <RegisterDialogue open={registerOpen} onClose={handleRegisterFormClose} />
      <AdminDialogue open={adminOpen} onClose={handleAdminFormClose} />
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