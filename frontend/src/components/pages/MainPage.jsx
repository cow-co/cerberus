import AlertsBar from "../elements/AlertsBar";
import ImplantsPane from "../elements/ImplantsPane";
import LoginDialogue from "../elements/LoginDialogue";
import RegisterDialogue from "../elements/RegisterDialogue";
import TasksPane from "../elements/TasksPane";
import { useState } from 'react';
import { Box, Grid, AppBar, Toolbar, Button, Typography } from '@mui/material';
import { register, login, logout } from "../../functions/apiCalls";
import { useSelector, useDispatch } from "react-redux";
import { setUsername } from "../../common/redux/users-slice";
import conf from "../../common/config/properties";
import { addAlert, removeAlert } from "../../common/redux/alerts-slice";
import { v4 as uuidv4 } from "uuid";

function MainPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const loggedInUser = useSelector((state) => state.users.username);
  const dispatch = useDispatch();

  const handleLoginFormOpen = () => {
    setLoginOpen(true);
  }

  const handleLoginFormClose = () => {
    setLoginOpen(false);
  }

  const handleLoginFormSubmit = async (username, password) => {
    const response = await login(username, password);
    if (response.errors.length > 0) {
      response.errors.forEach((error) => {
        // TODO Make a utility method to generate an alert
        const uuid = uuidv4();
        const alert = {
          id: uuid,
          type: "error",
          message: error
        };
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(uuid)), conf.alertsTimeout);
      });
    } else {
        const uuid = uuidv4();
        const alert = {
          id: uuid,
          type: "success",
          message: "Successfully logged in"
        };
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(uuid)), conf.alertsTimeout);
        dispatch(setUsername(response.username));
        handleLoginFormClose();
    }
  }

  const handleRegisterFormOpen = () => {
    setRegisterOpen(true);
  }

  const handleRegisterFormClose = () => {
    setRegisterOpen(false);
  }

  const handleRegisterFormSubmit = async (username, password) => {
    const errors = await register(username, password);
    if (errors.length > 0) {
      errors.forEach((error) => {
        // TODO Make a utility method to generate an alert
        const uuid = uuidv4();
        const alert = {
          id: uuid,
          type: "error",
          message: error
        };
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(uuid)), conf.alertsTimeout);
      });
    } else {
        const uuid = uuidv4();
        const alert = {
          id: uuid,
          type: "success",
          message: "Successfully registered"
        };
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(uuid)), conf.alertsTimeout);
        handleRegisterFormClose();
    }
  }

  const handleLogout = async (username, password) => {
    const errors = await logout();
    if (errors.length > 0) {
      errors.forEach((error) => {
        // TODO Make a utility method to generate an alert
        const uuid = uuidv4();
        const alert = {
          id: uuid,
          type: "error",
          message: error
        };
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(uuid)), conf.alertsTimeout);
      });
    } else {
        const uuid = uuidv4();
        const alert = {
          id: uuid,
          type: "success",
          message: "Successfully logged out"
        };
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(uuid)), conf.alertsTimeout);
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