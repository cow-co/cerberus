import { createSlice } from "@reduxjs/toolkit";

export const tasksSlice = createSlice({
  name: "tasks",
  initialState: {
    tasks: [],
    taskTypes: [],
  },
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },
    setTaskTypes: (state, action) => {
      state.taskTypes = action.payload;
    },
  },
});

export const { setTasks, setTaskTypes } = tasksSlice.actions;
export default tasksSlice.reducer;
