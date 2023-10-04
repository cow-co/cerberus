import { useSelector } from "react-redux";
import { Alert } from "@mui/material";

const AlertsBar = () => {
  const alerts = useSelector((state) => state.alerts.alerts);

  return alerts.map(alert => <Alert severity={alert.type}>{alert.message}</Alert>);
}

export default AlertsBar;