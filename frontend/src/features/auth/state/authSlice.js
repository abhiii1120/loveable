import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user:{},
    isloading:false,
    accessToken:null
};

export const authSlice = createSlice({
    name:"auth",
    initialState,
    reducers:{
        addUser:(state,action)=> {
            state.user = action.payload.UserData;
            state.accessToken = action.payload.accessToken;
        },
        removeUser:(state) => {
            state.user = initialState.user
        }
    }
})

export const {addUser,removeUser} = authSlice.actions

export default authSlice.reducer;