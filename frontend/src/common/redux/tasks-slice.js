import { createSlice } from "@reduxjs/toolkit";
import { EMPTY_TASK } from "../utils";

// Central store for keeping track of what tasks there are
export const tasksSlice = createSlice({
  name: "tasks",
  initialState: {
    taskTypes: [],
    selected: EMPTY_TASK,
    selectedType: { _id: "", name: "", params: [] },
  },
  reducers: {
    setTaskTypes: (state, action) => {
      state.taskTypes = action.payload;
    },
    setSelectedTask: (state, action) => {
      state.selected = action.payload;
    },
    setSelectedTaskType: (state, action) => {
      state.selectedType = action.payload;
    },
  },
});

export const { setTaskTypes, setSelectedTask, setSelectedTaskType } =
  tasksSlice.actions;
export default tasksSlice.reducer;
