import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize auth session on app load
// This will be called when the App component mounts
createRoot(document.getElementById("root")!).render(<App />);
