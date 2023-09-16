import { configureStore } from "@reduxjs/toolkit";
import alertsReducer from "./alerts-slice";
import tasksReducer from "./tasks-slice";
import implantsReducer from "./implants-slice";

export default configureStore({
  reducer: {
    alerts: alertsReducer,
    tasks: tasksReducer,
    implants: implantsReducer,
  },
});
