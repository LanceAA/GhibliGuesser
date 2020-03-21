import React from "react";
import "@fortawesome/fontawesome-free/css/all.css";

export const Loading = () => {
  return (
    <div className="row">
      <div className="col text-center mt-5">
        <div className="mb-5">
          <i id="first-d" className="fas fa-circle mr-4 dot"></i>
          <i id="second-d" className="fas fa-circle mr-4 dot"></i>
          <i id="third-d" className="fas fa-circle dot"></i>
        </div>
        <p id="load-text">Loading</p>
      </div>
    </div>
  );
};
