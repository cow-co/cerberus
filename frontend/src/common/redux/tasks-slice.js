import { createSlice } from "@reduxjs/toolkit";

// Central store for keeping track of what tasks there are
export const tasksSlice = createSlice({
  name: "tasks",
  initialState: {
    taskTypes: [],
  },
  reducers: {
    setTaskTypes: (state, action) => {
      state.taskTypes = action.payload;
    },
  },
});

export const { setTaskTypes } = tasksSlice.actions;
export default tasksSlice.reducer;
