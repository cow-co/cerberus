import { createSlice } from "@reduxjs/toolkit";

// Central store for keeping track of what groups there are, and which one we
// are working with (for edit/delete purposes)
export const groupsSlice = createSlice({
  name: "groups",
  initialState: {
    groups: [],
    selected: { name: "" },
  },
  reducers: {
    setGroups: (state, action) => {
      state.groups = action.payload;
    },
    setSelectedGroup: (state, action) => {
      state.selected = action.payload;
    },
  },
});

export const { setGroups, setSelectedGroup } = groupsSlice.actions;
export default groupsSlice.reducer;
