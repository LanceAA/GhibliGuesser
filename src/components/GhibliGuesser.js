import React from "react";
import Home from "./Home";
import { SearchPageWithRouter } from "./People";
import { Switch, Route } from "react-router-dom";
import FilmSearch from "./Films.js";

function importAll(r) {
  let images = {};
  r.keys().forEach(image => {
    images[image.split(".")[1].replace("/", "")] = r(image);
  });
  return images;
}

const peopleImages = importAll(
  require.context("../assets/people", false, /\.(png|jpe?g|svg)$/)
);

const filmImages = importAll(
  require.context("../assets/films", false, /\.(png|jpe?g|svg)$/)
);

export default class GhibliGuesser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    console.log("mounted here");
  }

  componentWillUnmount() {
    console.log("unmounting here");
  }

  render() {
    return (
      <Switch>
        <Route path="/people">
          <SearchPageWithRouter images={peopleImages} title="People" />
        </Route>
        <Route path="/films">
          <FilmSearch
            title="Films"
            images={filmImages}
            peopleImages={peopleImages}
          />
        </Route>
        <Route path="/locations">
          <SearchPageWithRouter />
        </Route>
        <Route path="/species">
          <SearchPageWithRouter />
        </Route>
        <Route exact path="/">
          <Home />
        </Route>
      </Switch>
    );
  }
}
