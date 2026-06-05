import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { enableClientProtection } from "./lib/protect";

enableClientProtection();

createRoot(document.getElementById("root")!).render(<App />);
