import React from "react";
import { Link } from "react-router-dom";

export const Header = ({ title }) => {
  return (
    <>
      <div className="row pb-4 theme-dark-bg">
        <div className="col-1">
          <Link className="mt-3 btn btn-outline-theme-dark" to="/">
            Home
          </Link>
        </div>
        <div className="col offset-1 mt-3 mb-4">
          <h1 id="search-title" className="theme-dark-color">
            {title}
          </h1>
        </div>
      </div>
    </>
  );
};
