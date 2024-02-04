import { createSlice } from "@reduxjs/toolkit";
import { EMPTY_USER } from "../utils";

// Central store for keeping track of what user is logged in
export const usersSlice = createSlice({
  name: "users",
  initialState: {
    username: "",
    isAdmin: false,
    token: "",
    selectedUser: EMPTY_USER,
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
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
  },
});

export const { setUsername, setIsAdmin, setToken, setSelectedUser } =
  usersSlice.actions;
export default usersSlice.reducer;
