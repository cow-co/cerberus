import { createSlice } from "@reduxjs/toolkit";

// Central store for keeping track of what implants there are, and which one we
// are working with (for edit/delete purposes)
export const implantsSlice = createSlice({
  name: "implants",
  initialState: {
    implants: [], // TODO Maybe we should move this list to local state in the ImplantsPane, since it's only used in there I think
    selected: { id: "", readOnlyACGs: [], operatorACGs: [] },
  },
  reducers: {
    setImplants: (state, action) => {
      state.implants = action.payload;
    },
    setSelectedImplant: (state, action) => {
      state.selected = action.payload;
    },
  },
});

export const { setImplants, setSelectedImplant } = implantsSlice.actions;
export default implantsSlice.reducer;
