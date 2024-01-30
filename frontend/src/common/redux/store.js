import { configureStore } from "@reduxjs/toolkit";
import alertsReducer from "./alerts-slice";
import tasksReducer from "./tasks-slice";
import implantsReducer from "./implants-slice";
import usersReducer from "./users-slice";
import groupsReducer from "./groups-slice";
import confirmationReducer from "./confirmation-slice";

export default configureStore({
  reducer: {
    alerts: alertsReducer,
    tasks: tasksReducer,
    implants: implantsReducer,
    users: usersReducer,
    groups: groupsReducer,
    confirmation: confirmationReducer,
  },
});
