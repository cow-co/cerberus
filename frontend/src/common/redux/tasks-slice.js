import { createSlice } from "@reduxjs/toolkit";

// Central store for keeping track of what tasks there are
export const tasksSlice = createSlice({
  name: "tasks",
  initialState: {
    tasks: [], // TODO Maybe we should move this list to local state in the TasksPane, since it's only used in there I think
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
