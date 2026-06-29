// src/app/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Providers } from "./Providers";
import AppContent from "./App";
import "../styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <AppContent />
    </Providers>
  </StrictMode>
);