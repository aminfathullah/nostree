import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { I18nProvider } from "./i18n/context";
import { AuthProvider } from "./context/AuthContext";
import { connectNDK } from "./lib/ndk";
import App from "./App";
import "./styles/global.css";

connectNDK().catch(() => {});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <App />
          <Toaster 
            position="top-right" 
            richColors 
            theme="dark"
          />
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  </React.StrictMode>
);
