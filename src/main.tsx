import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";


const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("❌ Root element not found. Make sure you have <div id='root'></div> in index.html.");
}

ReactDOM.createRoot(rootElement as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
