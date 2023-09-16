import { createSlice } from "@reduxjs/toolkit";

export const alertsSlice = createSlice({
  name: "alerts",
  initialState: {
    alerts: [],
  },
  reducers: {
    addAlert: (state, action) => {
      state.alerts.push(action.payload);
    },
  },
});

export const { addAlert } = alertsSlice.actions;
export default alertsSlice.reducer;
