import React from "react";
import peopleThumb from "../assets/people-thumbnail.png";
import peopleThumbGif from "../assets/people-thumbnail-gif.gif";
import locationsThumb from "../assets/locations-thumbnail.png";
import locationsThumbGif from "../assets/locations-thumbnail-gif.gif";
import filmsThumb from "../assets/films-thumbnail.png";
import filmsThumbGif from "../assets/films-thumbnail-gif.gif";
import speciesThumb from "../assets/species-thumbnail.png";
import speciesThumbGif from "../assets/species-thumbnail-gif.gif";
import { Link } from "react-router-dom";
import { Footer } from "./reusable/Footer.js";

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      images: {
        people: {
          current: peopleThumb,
          stored: peopleThumbGif
        },
        films: {
          current: filmsThumb,
          stored: filmsThumbGif
        },
        locations: {
          current: locationsThumb,
          stored: locationsThumbGif
        },
        species: {
          current: speciesThumb,
          stored: speciesThumbGif
        }
      }
    };
    this.switchImage = this.switchImage.bind(this);
  }

  switchImage({ target }) {
    const title = target.dataset.title;
    this.setState({
      images: {
        ...this.state.images,
        [title]: {
          current: this.state.images[title].stored,
          stored: this.state.images[title].current
        }
      }
    });
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
          <div className="faux-row-margin" id="background-top">
            <div id="tint" className="d-flex justify-content-center">
              <h1 id="home-title" className="pt-5">
                Ghibli Guesser
              </h1>
            </div>
          </div>
          <div className="row" id="category-thumbs">
            <div className="col-2 offset-3 mb-5">
              <div
                className="card category-thumb"
                onMouseEnter={this.switchImage}
                onMouseLeave={this.switchImage}
                data-title={"people"}
              >
                <Link to="/people" className="remove-anchor-styling">
                  <img
                    className="card-img-top"
                    src={this.state.images.people.current}
                    data-title={"people"}
                  />
                  <div
                    className="card-body category-thumb-body"
                    data-title={"people"}
                  >
                    <h2 className="text-center">People</h2>
                  </div>
                </Link>
              </div>
            </div>
            <div className="col-2 offset-2 mb-5">
              <div
                className="card category-thumb"
                onMouseEnter={this.switchImage}
                onMouseLeave={this.switchImage}
                data-title={"locations"}
              >
                <Link to="/locations" className="remove-anchor-styling">
                  <img
                    className="card-img-top"
                    src={this.state.images.locations.current}
                    data-title={"locations"}
                  />
                  <div
                    className="card-body category-thumb-body"
                    data-title={"locations"}
                  >
                    <h2 className="text-center">Locations</h2>
                  </div>
                </Link>
              </div>
            </div>
            <div className="w-100"></div>
            <div className="col-2 offset-3">
              <div
                className="card category-thumb"
                onMouseEnter={this.switchImage}
                onMouseLeave={this.switchImage}
                data-title={"films"}
              >
                <Link to="/films" className="remove-anchor-styling">
                  <img
                    className="card-img-top"
                    src={this.state.images.films.current}
                    data-title={"films"}
                  />
                  <div
                    className="card-body category-thumb-body"
                    data-title={"films"}
                  >
                    <h2 className="text-center">Films</h2>
                  </div>
                </Link>
              </div>
            </div>
            <div className="col-2 offset-2">
              <div
                className="card category-thumb"
                onMouseEnter={this.switchImage}
                onMouseLeave={this.switchImage}
                data-title={"species"}
              >
                <Link to="/species" className="remove-anchor-styling">
                  <img
                    className="card-img-top"
                    src={this.state.images.species.current}
                    data-title={"species"}
                  />
                  <div
                    className="card-body category-thumb-body"
                    data-title={"species"}
                  >
                    <h2 className="text-center">Species</h2>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }
}
