import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import React from "react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  //<React.StrictMode>    // enable strictmode when spotting bugs with side effects
    <App />
  //</React.StrictMode>
);
