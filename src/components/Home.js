import React from "react";
import banner from "../assets/banner.png";
import peopleThumb from "../assets/people-thumbnail.png";
import locationsThumb from "../assets/locations-thumbnail.png";
import filmsThumb from "../assets/films-thumbnail.png";
import speciesThumb from "../assets/species-thumbnail.png";
import { Link } from "react-router-dom";

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.checkChecked = this.checkChecked.bind(this);
  }

  checkChecked(e) {
    console.log(e.target.checked);
  }

  render() {
    return (
      <>
        <div className="card" id="description-card">
          <div className="card-body">
            <div className="card-text" id="description-text">
              <p>
                An in-depth filter search for everything Ghibli. Great for
                discovery or when your favorite location, character, or film is
                on the tip of your tongue.
              </p>
            </div>
          </div>
        </div>
        <div className="container-fluid">
          <div className="row" id="background-top">
            <div className="col-4 offset-4 mt-4">
              <img className="img-fluid" src={banner} />
            </div>
          </div>
          <div className="row" id="category-thumbs">
            <div className="col-2 offset-3 mb-5">
              <div className="card category-thumb">
                <Link to="/people" className="remove-anchor-styling">
                  <img className="card-img-top" src={peopleThumb} />
                  <div className="card-body category-thumb-body">
                    <h2 className="text-center">People</h2>
                  </div>
                </Link>
              </div>
            </div>
            <div className="col-2 offset-2 mb-5">
              <div className="card category-thumb">
                <Link to="/locations" className="remove-anchor-styling">
                  <img className="card-img-top" src={locationsThumb} />
                  <div className="card-body category-thumb-body">
                    <h2 className="text-center">Locations</h2>
                  </div>
                </Link>
              </div>
            </div>
            <div className="w-100"></div>
            <div className="col-2 offset-3">
              <div className="card category-thumb">
                <Link to="/films" className="remove-anchor-styling">
                  <img className="card-img-top" src={filmsThumb} />
                  <div className="card-body category-thumb-body">
                    <h2 className="text-center">Films</h2>
                  </div>
                </Link>
              </div>
            </div>
            <div className="col-2 offset-2">
              <div className="card category-thumb">
                <Link to="/species" className="remove-anchor-styling">
                  <img className="card-img-top" src={speciesThumb} />
                  <div className="card-body category-thumb-body">
                    <h2 className="text-center">Species</h2>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div>
          <input type="checkbox" onClick={this.checkChecked}></input>
        </div>
      </>
    );
  }
}
