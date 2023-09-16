import { configureStore } from "@reduxjs/toolkit";
import alertsReducer from "./alerts-slice";

export default configureStore({
  reducer: {
    alerts: alertsReducer,
  },
});
