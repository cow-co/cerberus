import { createSlice } from "@reduxjs/toolkit";

export const confirmationSlice = createSlice({
  name: "confirmation",
  initialState: {
    message: "",
    open: false,
    onSubmit: () => {},
  },
  reducers: {
    setMessage: (state, action) => {
      state.message = action.payload;
    },
    setOpen: (state, action) => {
      state.open = action.payload;
    },
    setSubmitAction: (state, action) => {
      state.onSubmit = action.payload;
    },
  },
});

export const { setMessage, setOpen, setSubmitAction } =
  confirmationSlice.actions;
export default confirmationSlice.reducer;
