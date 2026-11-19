import { createSlice } from "@reduxjs/toolkit";
import { bootstrapSession, login, logout, refresh, register } from "./authThunk";

const initialState = {
  user: null,
  isloading: false,
  accessToken: null,
  initialized: false,
  isAuthenticated: false,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    tokenUpdated(state, action){
      state.user = action.payload.UserData;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.initialized = true;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers:(builder) => {
    builder
    // --- all addCase calls first ---
    .addCase(refresh.fulfilled,(state,action) => {
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user ?? state.user;
        state.isAuthenticated = true;
        state.initialized = true;
    })
    .addCase(refresh.rejected,() => ({
        ...initialState,initialized:true
    }))
    .addCase(bootstrapSession.fulfilled,(state,action) => {
        if(action.payload.skipped){
            state.initialized = true;
            return;
        }
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.UserData;
        state.isAuthenticated = true
        state.initialized = true
    })
    .addCase(bootstrapSession.rejected,() => ({
        ...initialState,
        initialized:true
    }))
    .addCase(logout.fulfilled,() => ({
        ...initialState,
        initialized:true
    }))
    .addCase(logout.rejected,() => ({
        ...initialState,
        initialized:true
    }))
    // --- then all addMatcher calls ---
    .addMatcher(
        (action) =>
        [register.pending,login.pending].some((t) => t.match(action)),
        (state) => {
            state.isloading = true;
            state.error = null;
        }
    )
    .addMatcher(
        (action) => 
        [register.fulfilled,login.fulfilled].some((t) => t.match(action)),
        (state,action) => {
            state.isloading = false;
            state.user = action.payload.UserData;
            state.accessToken = action.payload.accessToken;
            state.isAuthenticated = true;
            state.initialized = true;
            state.error = null;
        }
    )
    .addMatcher(
        (action) =>
        [register.rejected,login.rejected].some((t) => t.match(action)),
        (state,action) => {
            state.isloading = false;
            state.error = action.payload;
        }
    )
  }
});

export const { addUser, removeUser } = authSlice.actions;

export default authSlice.reducer;
export {register,login} from "./authThunk";