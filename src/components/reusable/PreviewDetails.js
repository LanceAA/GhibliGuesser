import React from "react";

export const PreviewDetails = ({
  name,
  borderRules,
  image,
  chevronClicked,
  onClickHandler
}) => {
  return (
    <div
      className={`row pt-2 pb-2 align-items-center dim-on-hover cursor-pointer-on-hover ${borderRules}`}
      onClick={onClickHandler}
    >
      <div className="col-1">
        <img className="people-thumb" src={image} />
      </div>
      <div className="col-8 offset-1 text-center">
        <p className="people-title">{name}</p>
      </div>
      <div className="col-1 offset-1">
        <i
          className={`fas ${chevronClicked} people-chevron cursor-pointer-on-hover`}
        ></i>
      </div>
    </div>
  );
};
