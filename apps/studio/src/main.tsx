import React from "react";
import ReactDOM from "react-dom/client";
import Chart from "../../../package/dist/esm/index.js";
import "../../../package/dist/toastui-chart.css";
import "../../../packages/theme/sc-theme.css";
import App from "./App";
import "./styles.css";

(window as unknown as { toastui?: { Chart: typeof Chart } }).toastui = { Chart };

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
