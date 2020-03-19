import React from "react";

export const CharacterThumbnails = ({ people, images }) => {
  if (people.length > 0) {
    const peopleAry = people.map(person => {
      return (
        <div className="ml-3 d-inline-block" key={person.name}>
          <img
            className="character-thumb"
            src={images[person.name.toLowerCase()].default}
            title={person.name}
          />
        </div>
      );
    });
    return <div className="faux-row-margin">{peopleAry}</div>;
  } else {
    return (
      <div className="faux-row-margin">
        <p className="ml-3">Not Available</p>
      </div>
    );
  }
};
