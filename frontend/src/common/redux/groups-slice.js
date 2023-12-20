import { createSlice } from "@reduxjs/toolkit";

export const groupsSlice = createSlice({
  name: "groups",
  initialState: {
    groups: []
  },
  reducers: {
    setGroups: (state, action) => {
      state.groups = action.payload;
    },
  },
});

export const { setGroups } = groupsSlice.actions;
export default groupsSlice.reducer;
