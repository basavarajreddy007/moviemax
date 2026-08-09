import { useDispatch, useSelector } from "react-redux";
import {
  selectUser,
  selectAuthLoading,
  selectAuthError,
  setUser,
  login,
  googleLogin,
  verifyLoginOtp,
  register,
  verifyOtp,
  logout,
  loadUser,
} from "../redux/slices/authSlice";

export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  return {
    user,
    loading,
    error,
    setUser: (u) => dispatch(setUser(u)),
    login: (credentials) => dispatch(login(credentials)).unwrap(),
    googleLogin: (credential) => dispatch(googleLogin(credential)).unwrap(),
    verifyLoginOtp: (otpData) => dispatch(verifyLoginOtp(otpData)).unwrap(),
    register: (userData) => dispatch(register(userData)).unwrap(),
    verifyOtp: (otpData) => dispatch(verifyOtp(otpData)).unwrap(),
    logout: () => dispatch(logout()),
    loadUser: () => dispatch(loadUser()),
  };
}
