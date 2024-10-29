import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

const initialState = {
    isLogin: false,
    user: "",
    role: "",
    time: "",
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        userLogin: (state, action) => {
            state.isLogin = true;
            state.user = action.payload.username;
            state.role = action.payload.role;
            state.time = action.payload.time;
        },
        userLogout: (state) => {
            state.isLogin = false;
            state.user = "";
            state.role = "";
            state.time = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(PURGE, () => initialState);
    },
});

export const { userLogin, userLogout } = userSlice.actions;
export default userSlice.reducer;
