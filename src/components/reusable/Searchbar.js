import React from "react";
import "@fortawesome/fontawesome-free/css/all.css";

export const Searchbar = ({ search, onChangeHandler }) => {
  return (
    <>
      <div className="row mb-2">
        <div className="col-6 offset-3">
          <div className="input-group mb-2">
            <div className="input-group-prepend">
              <i
                id="searchbar-icon"
                className="input-group-text fas fa-search"
              ></i>
            </div>
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              value={search}
              onChange={onChangeHandler}
            />
          </div>
        </div>
      </div>
    </>
  );
};
