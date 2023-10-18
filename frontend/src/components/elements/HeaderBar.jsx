import { AppBar, Toolbar, Button, Typography, Link } from "@mui/material";
import { checkSessionCookie, logout } from "../../functions/apiCalls";
import { setUsername } from "../../common/redux/users-slice";
import { addAlert, removeAlert } from "../../common/redux/alerts-slice";
import { generateAlert } from "../../common/utils";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import conf from "../../common/config/properties";
import { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useErrorHandler } from "react-error-boundary";

const HeaderBar = (props) => {
  const dispatch = useDispatch();
  const username = useSelector((state) => state.users.username);
  const handleError = useErrorHandler();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await checkSessionCookie();      
        dispatch(setUsername(user.username));
      } catch (err) {
        handleError(err);
      }
    }
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const handleLogout = async () => {
    try {
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
    } catch (err) {
      handleError(err);
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
          <Link underline="none" component={RouterLink} to={"admin"}>Admin</Link>
        </Toolbar>
      </AppBar>);
}

export default HeaderBar;