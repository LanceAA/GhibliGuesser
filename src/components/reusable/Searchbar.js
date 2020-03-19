import React from "react";
import "@fortawesome/fontawesome-free/css/all.css";

export const Searchbar = ({ search, onChangeHandler }) => {
  return (
    <>
      <div className="row pb-3 theme-dark-bg">
        <div className="col-6 offset-3">
          <input
            id="searchbar"
            type="text"
            className="form-control"
            placeholder="Search..."
            value={search}
            onChange={onChangeHandler}
          />
        </div>
      </div>
    </>
  );
};
