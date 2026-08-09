import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI } from "../../services/api";

export const loadUser = createAsyncThunk("auth/loadUser", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return rejectWithValue("No token");
    const { data } = await authAPI.getMe();
    return data.data;
  } catch (err) {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    return rejectWithValue(err.response?.data?.message || "Failed to load user");
  }
});

export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.login(credentials);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

export const googleLogin = createAsyncThunk("auth/googleLogin", async (credential, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.googleLogin(credential);
    const authData = data.data || data;
    const { token, refreshToken, user } = authData;
    localStorage.setItem("token", token);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Google login failed");
  }
});

export const verifyLoginOtp = createAsyncThunk("auth/verifyLoginOtp", async (otpData, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.verifyLoginOtp(otpData);
    const { token, refreshToken, user } = data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "OTP verification failed");
  }
});

export const register = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.register(userData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Registration failed");
  }
});

export const verifyOtp = createAsyncThunk("auth/verifyOtp", async (otpData, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.verifyOtp(otpData);
    const { token, refreshToken, user } = data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "OTP verification failed");
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await authAPI.logout();
  } catch (err) {
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: true,
    error: null,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {

    builder
      .addCase(loadUser.pending, (state) => { state.loading = true; })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(loadUser.rejected, (state) => {
        state.user = null;
        state.loading = false;
      });

    builder
      .addCase(googleLogin.fulfilled, (state, action) => { state.user = action.payload; })
      .addCase(googleLogin.rejected, (state, action) => { state.error = action.payload; });

    builder
      .addCase(verifyLoginOtp.fulfilled, (state, action) => { state.user = action.payload; })
      .addCase(verifyLoginOtp.rejected, (state, action) => { state.error = action.payload; });

    builder
      .addCase(verifyOtp.fulfilled, (state, action) => { state.user = action.payload; })
      .addCase(verifyOtp.rejected, (state, action) => { state.error = action.payload; });

    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.loading = false;
    });
  },
});

export const { setUser, clearError } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
