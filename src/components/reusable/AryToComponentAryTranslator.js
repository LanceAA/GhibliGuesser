import React from "react";

export const AryToComponentAryTranslator = ({ ary }) => {
  return ary.map(({ name, id }) => {
    return <p key={id}>{name}</p>;
  });
};
