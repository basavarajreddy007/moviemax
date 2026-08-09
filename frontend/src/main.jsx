import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import store from "./redux/store";
import { loadUser } from "./redux/slices/authSlice";
import App from "./App";
import "./css/index.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
if (!googleClientId) {
  console.error(
    "ERROR: VITE_GOOGLE_CLIENT_ID environment variable is missing! Google OAuth 2.0 Sign-In will not function. " +
    "Ensure VITE_GOOGLE_CLIENT_ID is defined in your environment/dotenv files."
  );
}

import { MotionConfig } from "framer-motion";

store.dispatch(loadUser());

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <GoogleOAuthProvider clientId={googleClientId || "google-client-id-placeholder"}>
        <MotionConfig reducedMotion="user">
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1F1F1F",
                color: "#FFFFFF",
                border: "1px solid rgba(255,255,255,0.1)",
              },
              success: { iconTheme: { primary: "#E50914", secondary: "#FFFFFF" } },
              error: { iconTheme: { primary: "#E50914", secondary: "#FFFFFF" } },
            }}
          />
        </MotionConfig>
      </GoogleOAuthProvider>
    </HashRouter>
  </Provider>
);
