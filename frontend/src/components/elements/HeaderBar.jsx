import { AppBar, Toolbar, Button, Typography } from "@mui/material";
import { checkSessionCookie, logout } from "../../functions/apiCalls";
import { setUsername } from "../../common/redux/users-slice";
import { addAlert, removeAlert } from "../../common/redux/alerts-slice";
import { generateAlert } from "../../common/utils";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import conf from "../../common/config/properties";
import { useEffect } from "react";

const HeaderBar = (props) => {
  const dispatch = useDispatch();
  const username = useSelector((state) => state.users.username);
  useEffect(() => {
    const checkSession = async () => {
      const user = await checkSessionCookie();
      dispatch(setUsername(user.username));
    }
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
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
        Cookies.remove("connect.sid");
    }
  }

  let loginoutButton = null;
  if (username) {
    loginoutButton = <Button onClick={handleLogout}>Log Out</Button>
  } else {
    loginoutButton = <Button onClick={props.handleLoginFormOpen}>Log In</Button>
  }

  return (
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
            Cerberus
          </Typography>
          <Button onClick={props.handleRegisterFormOpen}>Register</Button>
          {loginoutButton}
          <Button onClick={props.handleAdminFormOpen}>Admin</Button>
        </Toolbar>
      </AppBar>);
}

export default HeaderBar;