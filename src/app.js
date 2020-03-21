//Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method.in SpeciesSearch (created by GhibliGuesser)

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
