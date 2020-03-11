import React from "react";
import { Link } from "react-router-dom";

export const Header = ({ title }) => {
  return (
    <>
      <div className="row mb-4">
        <div className="col-1">
          <Link className="mt-3 btn btn-outline-secondary" to="/">
            Home
          </Link>
        </div>
        <div className="col offset-1 mt-3 mb-4">
          <h1 id="search-title">{title}</h1>
        </div>
      </div>
    </>
  );
};
