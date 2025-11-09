import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Auth0Provider } from "./lib/auth0";

createRoot(document.getElementById("root")!).render(
  <Auth0Provider>
    <App />
  </Auth0Provider>
);
