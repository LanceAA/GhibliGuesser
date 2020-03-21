import React from "react";
import Table from "./reusable/Table.js";
import { PreviewDetails } from "./reusable/PreviewDetails.js";
import { CharacterThumbnails } from "./reusable/CharacterThumbnails.js";
import { AryToComponentAryTranslator } from "./reusable/AryToComponentAryTranslator.js";
import { Footer } from "./reusable/Footer.js";
import { NoContent } from "./reusable/NoContent.js";
import { Loading } from "./reusable/Loading.js";
import { Head } from "./reusable/Head.js";
import girl from "../assets/girl.png";

export default class LocationSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      locations: [],
      filters: {},
      activeFilters: {
        climate: {},
        terrain: {}
      }
    };
    this.updateSearch = this.updateSearch.bind(this);
    this.toggleFilterClicked = this.toggleFilterClicked.bind(this);
    this.debounce = this.debounce.bind(this);
    this.filterLocations = this.filterLocations.bind(this);
  }

  filterLocations() {
    const activeFilters = this.state.activeFilters;
    const actFilHasClimate =
      Object.values(activeFilters.climate).find(climateName => climateName) !==
      undefined;
    const actFilHasTerrain =
      Object.values(activeFilters.terrain).find(terrainName => terrainName) !==
      undefined;

    const filteredLocations = this.state.locations.filter(location => {
      const climateIsActive = activeFilters.climate[location.climate];
      const terrainIsActive = activeFilters.terrain[location.terrain];
      const nameMatchesSearch =
        location.name.toLowerCase().indexOf(this.state.search.toLowerCase()) ===
        0;

      return (
        (climateIsActive || !actFilHasClimate) &&
        (terrainIsActive || !actFilHasTerrain) &&
        (nameMatchesSearch || this.state.search === "")
      );
    });

    this.setState({
      filteredLocations
    });
  }

  debounce() {
    clearTimeout(this.timer);
    this.timer = setTimeout(this.filterLocations, 400);
  }

  toggleFilterClicked(category, option) {
    let activeFilters = { ...this.state.activeFilters[category] };

    if (activeFilters[option]) {
      activeFilters[option] = false;
    } else {
      activeFilters[option] = true;
    }

    this.setState(
      {
        activeFilters: {
          ...this.state.activeFilters,
          [category]: activeFilters
        }
      },
      this.filterLocations
    );
  }

  updateSearch({ target }) {
    this.setState(
      {
        search: target.value
      },
      this.debounce
    );
  }

  componentDidMount() {
    Promise.all([
      fetch("https://ghibliapi.herokuapp.com/people"),
      fetch("https://ghibliapi.herokuapp.com/films"),
      fetch("https://ghibliapi.herokuapp.com/locations")
    ])
      .then(([people, films, locations]) => {
        return Promise.all([people.json(), films.json(), locations.json()]);
      })
      .then(([people, films, locations]) => {
        const filmsById = {};
        const peopleById = {};

        films.forEach(film => {
          filmsById[film.id] = film;
        });

        people.forEach(person => {
          peopleById[person.id] = person;
        });

        const filters = locations.reduce(
          (acc, curr) => {
            const fields = Object.keys(acc);
            fields.forEach(field => {
              if (curr[field] !== "TODO") {
                acc[field].list.add(curr[field]);
              }
            });
            return acc;
          },
          {
            climate: { list: new Set(), title: "Climate" },
            terrain: { list: new Set(), title: "Terrain" }
          }
        );

        Object.entries(filters).forEach(([category, obj]) => {
          filters[category].list = [...obj.list].map(option => {
            const rng = Math.floor(Math.random() * 100000000000);
            return {
              name: option,
              id: rng
            };
          });
        });

        locations.forEach((location, index) => {
          location.residents.forEach((resident, i) => {
            const residentId = resident.split("/people/")[1];
            if (residentId !== "" && residentId !== undefined) {
              locations[index].residents[i] = {
                name: peopleById[residentId].name,
                id: residentId
              };
            } else {
              locations[index].residents = [];
            }
          });
          location.films.forEach((film, i) => {
            const filmId = film.split("/films/")[1];
            if (filmId !== "") {
              locations[index].films[i] = {
                name: filmsById[filmId].title,
                id: filmId
              };
            } else {
              locations[index].films = [];
            }
          });
        });
        return Promise.all([filters, locations]);
      })
      .then(([filters, locations]) => {
        this.setState({
          filters,
          locations,
          filteredLocations: locations
        });
      });
  }

  render() {
    console.log(this.state);
    const { search, filters } = this.state;
    const { title, images, peopleImages } = this.props;
    let bodyContent;

    if (this.state.filteredLocations) {
      if (this.state.filteredLocations.length > 0) {
        bodyContent = (
          <Locations
            images={images}
            locations={this.state.filteredLocations}
            peopleImages={peopleImages}
          />
        );
      } else {
        bodyContent = <NoContent />;
      }
    } else {
      bodyContent = <Loading />;
    }

    return (
      <div id="master-container" className="container-fluid">
        <Head
          title={title}
          search={search}
          updateSearch={this.updateSearch}
          filters={filters}
          toggleFilterClicked={this.toggleFilterClicked}
          img={girl}
        />
        <div id="body-content" className="mt-5 mb-5">
          {bodyContent}
        </div>
        <Footer />
      </div>
    );
  }
}

const Locations = ({ locations, images, peopleImages }) => {
  const locationsAry = Object.values(locations).map(location => {
    return (
      <Location
        location={location}
        images={images}
        key={location.id}
        peopleImages={peopleImages}
      />
    );
  });

  return (
    <div className="faux-row-margin">
      <div className="col-8 offset-2 border-bottom">{locationsAry}</div>
    </div>
  );
};

class Location extends Table {
  constructor(props) {
    super(props);
  }

  render() {
    console.log(this.props);
    const { images, peopleImages } = this.props;
    const {
      name,
      climate,
      terrain,
      surface_water,
      residents,
      films
    } = this.props.location;
    const { chevronClicked, borderRules, detailContainer } = this.state;
    const nameCopy = name === "Piccolo S.P.A." ? "Piccolo S" : name;
    const image = images[nameCopy].default;

    return (
      <React.Fragment>
        <PreviewDetails
          name={name}
          borderRules={borderRules}
          image={image}
          chevronClicked={chevronClicked}
          onClickHandler={this.toggleShowDetails}
        />
        <div className={`${detailContainer} faux-row-margin pl-3 pr-3`}>
          <div className="row mb-2">
            <div className="col">
              <h5 className="underline">Climate</h5>
              <p>{climate}</p>
            </div>
            <div className="col">
              <h5 className="underline">Terrain</h5>
              <p>{terrain}</p>
            </div>
            <div className="col">
              <h5 className="underline">Surface Water</h5>
              <p>{surface_water}</p>
            </div>
          </div>
          <div className="row mb-2">
            <div className="col">
              <h5 className="underline">People</h5>
              <CharacterThumbnails people={residents} images={peopleImages} />
            </div>
          </div>
          <div className="row mb-2">
            <div className="col">
              <h5 className="underline">Films</h5>
              <AryToComponentAryTranslator ary={films} />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
