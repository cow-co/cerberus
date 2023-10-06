import AlertsBar from "../elements/AlertsBar";
import ImplantsPane from "../elements/ImplantsPane";
import LoginDialogue from "../elements/LoginDialogue";
import RegisterDialogue from "../elements/RegisterDialogue";
import TasksPane from "../elements/TasksPane";
import { useState } from 'react';
import { Box, Grid, AppBar, Toolbar, Button, Typography } from '@mui/material';
import { logout } from "../../functions/apiCalls";
import { useDispatch } from "react-redux";
import { setUsername } from "../../common/redux/users-slice";
import conf from "../../common/config/properties";
import { addAlert, removeAlert } from "../../common/redux/alerts-slice";
import { generateAlert, isLoggedIn } from "../../common/utils";
import AdminDialogue from "../elements/AdminDialogue";
import Cookies from "js-cookie";
import HeaderBar from "../elements/HeaderBar";

function MainPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const dispatch = useDispatch();

  // TODO Break App bar into separate component
  // TODO On app bar component mount, if connect.sid exists, ping off to a "checkSession" endpoint which will return the username if the session is valid
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