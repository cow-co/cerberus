import { useSelector } from "react-redux";
import { Alert, ListItem, List, AppBar, Box } from "@mui/material";

const AlertsBar = () => {
  const alerts = useSelector((state) => state.alerts.alerts);
  const items = alerts.map(alert => (<ListItem><Alert className="alert-message" severity={alert.type}>{alert.message}</Alert></ListItem>));

  return (
    <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0, zIndex: "2147483647" }} >
      <Box display="flex" sx={{width: "100%", position: "fixed", bottom: "0px", zIndex: "2147483647"}} justifyContent="center" alignItems="end" alignContent="end">
        <List>
          {items}
        </List>
      </Box>
    </AppBar>
  );
}

export default AlertsBar;