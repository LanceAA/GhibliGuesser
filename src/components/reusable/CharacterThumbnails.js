import React from "react";
import { Link } from "react-router-dom";

export const CharacterThumbnails = ({ people, images }) => {
  if (people.length > 0) {
    const peopleAry = people.map(person => {
      const image = images[person.name.toLowerCase()].default;
      return (
        <div className="ml-3 d-inline-block" key={person.name}>
          <Link to={`/people/${person.id}`}>
            <img className="character-thumb" src={image} title={person.name} />
          </Link>
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
