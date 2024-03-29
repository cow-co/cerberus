import { AppBar, Toolbar, Button, Typography } from "@mui/material";
import { checkToken, logout } from "../../../common/apiCalls";
import { setIsAdmin, setUsername, setToken } from "../../../common/redux/users-slice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { createErrorAlert, createSuccessAlert } from '../../../common/redux/dispatchers';

const HeaderBar = ({handleLoginFormOpen, handleRegisterFormOpen, handlePWChangeOpen}) => {
  const dispatch = useDispatch();
  const username = useSelector((state) => state.users.username);
  const isAdmin = useSelector((state) => state.users.isAdmin);

  useEffect(() => {
    const checkSession = async () => {
      const res = await checkToken();
      if (res.errors.length > 0) {
        createErrorAlert(res.errors);
        dispatch(setUsername(""));
        dispatch(setIsAdmin(false));
        dispatch(setToken(""));
      } else {
        dispatch(setUsername(res.user.name));
        dispatch(setIsAdmin(res.user.isAdmin));
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
      dispatch(setToken(""));
      localStorage.removeItem("token");
    }
  }

  let loginoutButton = <Button onClick={handleLoginFormOpen}>Log In</Button>;
  if (username) {
    loginoutButton = <Button onClick={handleLogout}>Log Out</Button>
  }

  let adminButton = null;
  if (isAdmin) {
    adminButton = <Button component={RouterLink} to={"/admin"}>Admin</Button>;
  }

  let registerButton = <Button onClick={handleRegisterFormOpen}>Register</Button>;
  if (username) {
    registerButton = <Button onClick={handlePWChangeOpen}>Change Password</Button>
  }

  return (
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
            <Button component={RouterLink} to={"/"}>
                Cerberus
            </Button>
          </Typography>
          {registerButton}
          {loginoutButton}
          {adminButton}
        </Toolbar>
      </AppBar>);
}

export default HeaderBar;