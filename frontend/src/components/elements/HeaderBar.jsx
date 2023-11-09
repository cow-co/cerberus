import { AppBar, Toolbar, Button, Typography, Link } from "@mui/material";
import { checkSessionCookie, logout } from "../../common/apiCalls";
import { setIsAdmin, setUsername } from "../../common/redux/users-slice";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { createErrorAlert, createSuccessAlert } from '../../common/redux/dispatchers';
import { setImplants } from "../../common/redux/implants-slice";

const HeaderBar = (props) => {
  const dispatch = useDispatch();
  const username = useSelector((state) => state.users.username);
  const isAdmin = useSelector((state) => state.users.isAdmin);

  useEffect(() => {
    const checkSession = async () => {
      const res = await checkSessionCookie();
      if (res.errors.length > 0) {
        createErrorAlert(res.errors);
      } else {
        dispatch(setUsername(res.username));
        dispatch(setIsAdmin(res.isAdmin));
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
      dispatch(setIsAdmin(false));
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

  let adminButton = null;
  if (isAdmin) {
    adminButton = <Link underline="none" component={RouterLink} to={"admin"}>Admin</Link>;
  }

  return (
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
            Cerberus
          </Typography>
          <Button onClick={props.handleRegisterFormOpen}>Register</Button>
          {loginoutButton}
          {adminButton}
        </Toolbar>
      </AppBar>);
}

export default HeaderBar;