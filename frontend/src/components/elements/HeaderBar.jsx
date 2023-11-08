import { AppBar, Toolbar, Button, Typography, Link } from "@mui/material";
import { checkSessionCookie, logout } from "../../common/apiCalls";
import { setUsername } from "../../common/redux/users-slice";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { createErrorAlert, createSuccessAlert } from '../../common/redux/dispatchers';
import { setImplants } from "../../common/redux/implants-slice";

const HeaderBar = (props) => {
  const dispatch = useDispatch();
  const username = useSelector((state) => state.users.username);
  useEffect(() => {
    const checkSession = async () => {
      const res = await checkSessionCookie();
      if (res.errors.length > 0) {
        createErrorAlert(res.errors);
      } else {
        dispatch(setUsername(res.username));
      }      
    }
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const handleLogout = async () => {
    const { errors } = await logout();
    if (errors.length > 0) {
      createErrorAlert(errors);
    } else {
      createSuccessAlert("Successfully logged out");
      dispatch(setUsername(""));
      dispatch(setImplants([]));
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
          <Link underline="none" component={RouterLink} to={"admin"}>Admin</Link>
        </Toolbar>
      </AppBar>);
}

export default HeaderBar;