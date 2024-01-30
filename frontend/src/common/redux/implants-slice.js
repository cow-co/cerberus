import { createSlice } from "@reduxjs/toolkit";

// Central store for keeping track of what implants there are, and which one we
// are working with (for edit/delete purposes)
export const implantsSlice = createSlice({
  name: "implants",
  initialState: {
    selected: { id: "", readOnlyACGs: [], operatorACGs: [] },
  },
  reducers: {
    setSelectedImplant: (state, action) => {
      state.selected = action.payload;
    },
  },
});

export const { setSelectedImplant } = implantsSlice.actions;
export default implantsSlice.reducer;
