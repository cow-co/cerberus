import { AppBar, Toolbar, Button, Typography } from "@mui/material";
import { checkToken, logout } from "../../../common/apiCalls";
import { setIsAdmin, setUsername, setToken } from "../../../common/redux/users-slice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { createErrorAlert, createSuccessAlert } from '../../../common/redux/dispatchers';
import { setImplants } from "../../../common/redux/implants-slice";

const HeaderBar = (props) => {
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
      dispatch(setImplants([]));
      // TODO Clear out selected implants, groups, etc?
      // TODO Maybe move this stuff to the components themselves and use useEffect in them to listen to a change in username/token
      localStorage.removeItem("token");
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
    adminButton = <Button component={RouterLink} to={"/admin"}>Admin</Button>;
  }

  return (
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
            <Button component={RouterLink} to={"/"}>
                Cerberus
            </Button>
          </Typography>
          <Button onClick={props.handleRegisterFormOpen}>Register</Button>
          {loginoutButton}
          {adminButton}
        </Toolbar>
      </AppBar>);
}

export default HeaderBar;