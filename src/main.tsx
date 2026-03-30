import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const normalizedPathname = window.location.pathname.replace(/\/{2,}/g, "/");
if (normalizedPathname !== window.location.pathname) {
	const normalizedUrl = `${normalizedPathname}${window.location.search}${window.location.hash}`;
	window.history.replaceState(window.history.state, "", normalizedUrl);
}

// Initialize auth session on app load
// This will be called when the App component mounts
createRoot(document.getElementById("root")!).render(<App />);
