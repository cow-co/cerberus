import { createSlice } from "@reduxjs/toolkit";

// TODO Have something in here that handles login/logout? Set username was meant to do that though...
export const usersSlice = createSlice({
  name: "users",
  initialState: {
    username: "",
  },
  reducers: {
    setUsername: (state, action) => {
      state.username = action.payload;
    },
  },
});

export const { setUsername } = usersSlice.actions;
export default usersSlice.reducer;
