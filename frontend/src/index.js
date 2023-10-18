import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import store from "./common/redux/store";
import { Provider } from "react-redux";
import CustomErrorBoundary from "./components/elements/error/CustomErrorBoundary";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <CustomErrorBoundary>
        <App />
      </CustomErrorBoundary>
    </Provider>
  </React.StrictMode>
);
