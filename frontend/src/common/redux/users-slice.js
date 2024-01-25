import { createSlice } from "@reduxjs/toolkit";

export const usersSlice = createSlice({
  name: "users",
  initialState: {
    username: "",
    isAdmin: false,
    token: ""
  },
  reducers: {
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    setIsAdmin: (state, action) => {
      state.isAdmin = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    }
  },
});

export const { setUsername, setIsAdmin, setToken } = usersSlice.actions;
export default usersSlice.reducer;
