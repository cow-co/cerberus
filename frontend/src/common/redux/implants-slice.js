import { createSlice } from "@reduxjs/toolkit";

export const implantsSlice = createSlice({
  name: "implants",
  initialState: {
    implants: [],
  },
  reducers: {
    setImplants: (state, action) => {
      state.implants = action.payload;
    },
  },
});

export const { setImplants } = implantsSlice.actions;
export default implantsSlice.reducer;
