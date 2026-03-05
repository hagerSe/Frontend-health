<<<<<<< HEAD
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { BrowserRouter } from "react-router-dom";
=======
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // ← This is important
import '@fortawesome/fontawesome-free/css/all.min.css';
>>>>>>> b43e6a4d7413253110d828972d10017b2a5508e8

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);