//dark mode
//save to github
//design search page

import "./style.sass";
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import ReactDOM from "react-dom";
import GhibliGuesser from "./components/GhibliGuesser";
import { BrowserRouter as Router } from "react-router-dom";

const root = document.getElementById("root");

function App() {
  return (
    <Router>
      <GhibliGuesser />
    </Router>
  );
}

ReactDOM.render(<App />, root);
