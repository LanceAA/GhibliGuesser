import React from "react";
import "@fortawesome/fontawesome-free/css/all.css";

export const NoContent = () => {
  return (
    <div className="row">
      <div className="col text-center">
        <i id="no-match-icon" className="fas fa-glasses mb-3"></i>
        <h1 id="no-match-text">No matches found</h1>
      </div>
    </div>
  );
};
