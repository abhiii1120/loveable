import { createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "@/shared/service/authService";
import { setAccessToken } from "@/shared/service/httpClient";
import { useDispatch } from "react-redux";
import { parseError } from "@/shared/utils/utils";

export const register = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await authService.register(payload);
      setAccessToken(data.accessToken);
      return data;
    } catch (error) {
      return rejectWithValue(parseError(error));
    }
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await authService.login(payload);
      setAccessToken(data.accessToken);
      return data;
    } catch (error) {
      return rejectWithValue(parseError(error));
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await authService.logout();
  } catch (error) {
    setAccessToken(null);
  }
});

export const refresh = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authService.refreshToken();
      setAccessToken(data.accessToken);
      return data;
    } catch (error) {
      setAccessToken(null);
      return rejectWithValue(parseError(error));
    }
  },
);

export const bootstrapSession = createAsyncThunk(
  "auth/bootstrapSession",
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if(auth.initialized){
        return {skipped:true,isAuthenticated:auth.isAuthenticated}
    }
    try {
        const {data} = await authService.refreshToken();
        setAccessToken(data.accessToken)
        return data
    } catch (error) {
        setAccessToken(null)
        return rejectWithValue(parseError(error));
    }
  },
);
