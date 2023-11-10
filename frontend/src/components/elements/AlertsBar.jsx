import { useSelector } from "react-redux";
import { Alert, ListItem, List } from "@mui/material";

const AlertsBar = () => {
  const alerts = useSelector((state) => state.alerts.alerts);
  const items = alerts.map(alert => (<ListItem><Alert className="alert-message" severity={alert.type}>{alert.message}</Alert></ListItem>));

  return (
    <List >
      {items}
    </List>
  );
}

export default AlertsBar;