import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user:{},
    isloading:false
};

export const authSlice = createSlice({
    name:"auth",
    initialState,
    reducers:{
        addUser:(state,action)=> {
            state.user = action.payload
        },
        removeUser:(state) => {
            state.user = initialState.user
        }
    }
})

export const {addUser,removeUser} = authSlice.actions

export default authSlice.reducer;