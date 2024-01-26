import { createSlice } from "@reduxjs/toolkit";

export const implantsSlice = createSlice({
  name: "implants",
  initialState: {
    implants: [],
    selected: { id: "", readOnlyACGs: [], operatorACGs: [] },
  },
  reducers: {
    setImplants: (state, action) => {
      state.implants = action.payload;
    },
    setSelectedImplant: (state, action) => {
      console.log(action);
      state.selected = action.payload;
      console.log(state);
    },
  },
});

export const { setImplants, setSelectedImplant } = implantsSlice.actions;
export default implantsSlice.reducer;
