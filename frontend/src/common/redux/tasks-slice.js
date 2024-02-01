import { createSlice } from "@reduxjs/toolkit";
import { EMPTY_TASK } from "../utils";

// Central store for keeping track of what tasks there are
export const tasksSlice = createSlice({
  name: "tasks",
  initialState: {
    taskTypes: [],
    selected: EMPTY_TASK,
  },
  reducers: {
    setTaskTypes: (state, action) => {
      state.taskTypes = action.payload;
    },
    setSelectedTask: (state, action) => {
      state.selected = action.payload;
    },
  },
});

export const { setTaskTypes, setSelectedTask } = tasksSlice.actions;
export default tasksSlice.reducer;
