import { createSlice } from "@reduxjs/toolkit";


const authSlice = createSlice({
    name: "Auth",
    initialState: {
        token: localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token")) : null,
        userId: localStorage.getItem("userId") ? JSON.parse(localStorage.getItem("userId")) : null,
        selectedUser: null
    },
    reducers: {
        LoginInto: (state, action) => {
            const { token, userId } = action.payload
            state.token = token;
            state.userId = userId
            localStorage.setItem("token", JSON.stringify(token));
            localStorage.setItem("userId", JSON.stringify(userId));
        },
        logout: (state) => {
            state.token = null;
            state.userId = null;
            state.selectedUser=null;
            localStorage.clear()
        },
        setSelected: (state, action) => {
            state.selectedUser = action.payload
        }
    }

})

export const { LoginInto, logout,setSelected } = authSlice.actions
export default authSlice.reducer