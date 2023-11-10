import { createSlice } from "@reduxjs/toolkit";

export const alertsSlice = createSlice({
  name: "alerts",
  initialState: {
    alerts: [],
  },
  reducers: {
    // Expected structure of action.payload:
    // Object containing:
    // - ID
    // - Message
    // - Type
    addAlert: (state, action) => {
      state.alerts.push(action.payload);
    },
    // Expected structure of action.payload:
    // String ID
    removeAlert: (state, action) => {
      state.alerts = state.alerts.filter(
        (alert) => alert.id !== action.payload
      );
    },

    removeAllAlerts: (state, action) => {
      state.alerts = [];
    },
  },
});

export const { addAlert, removeAlert } = alertsSlice.actions;
export default alertsSlice.reducer;
