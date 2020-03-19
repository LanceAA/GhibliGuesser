import React from "react";
import { Header } from "./reusable/Header.js";
import { Searchbar } from "./reusable/Searchbar.js";
import Filter from "./reusable/Filter.js";
import { PreviewDetails } from "./reusable/PreviewDetails.js";
import { CharacterThumbnails } from "./reusable/CharacterThumbnails.js";
import { AryToComponentAryTranslator } from "./reusable/AryToComponentAryTranslator.js";
import { Footer } from "./reusable/Footer.js";
import { NoContent } from "./reusable/NoContent.js";

export default class LocationSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      locations: [],
      filteredLocations: [],
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
    const hasActiveClimate =
      Object.values(activeFilters.climate).find(climateName => climateName) !==
      undefined;
    const hasActiveTerrain =
      Object.values(activeFilters.terrain).find(terrainName => terrainName) !==
      undefined;

    const filteredLocations = this.state.locations.filter(location => {
      const nameMatchesSearch =
        location.name.toLowerCase().indexOf(this.state.search.toLowerCase()) ===
        0;

      return (
        (activeFilters.climate[location.climate] || !hasActiveClimate) &&
        (activeFilters.terrain[location.terrain] || !hasActiveTerrain) &&
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
    const { search, filters, filteredLocations } = this.state;
    const { title, images, peopleImages } = this.props;

    const table =
      filteredLocations.length > 0 ? (
        <Locations
          images={images}
          locations={filteredLocations}
          peopleImages={peopleImages}
        />
      ) : (
        <NoContent />
      );

    return (
      <div className="container-fluid">
        <div id="head">
          <Header title={title} />
          <Searchbar search={search} onChangeHandler={this.updateSearch} />
          <Filter
            filters={filters}
            toggleFilterClicked={this.toggleFilterClicked}
          />
        </div>
        <div id="body-content" className="mt-5 mb-5">
          {table}
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

  return <div className="faux-row-margin">{locationsAry}</div>;
};

class Location extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDetails: false,
      chevronClicked: "fa-chevron-down",
      borderBottom: "border-bottom-delay",
      detailContainer: "detail-container-hidden"
    };
    this.toggleShowDetails = this.toggleShowDetails.bind(this);
  }

  toggleShowDetails() {
    if (this.state.showDetails) {
      this.setState({
        showDetails: false,
        chevronClicked: "fa-chevron-down",
        borderBottom: "border-bottom-delay",
        detailContainer: "detail-container-hidden"
      });
    } else {
      this.setState({
        showDetails: true,
        chevronClicked: "fa-chevron-up",
        borderBottom: "border-bottom-0",
        detailContainer: "detail-container"
      });
    }
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
      films,
      id
    } = this.props.location;
    const { chevronClicked, borderBottom, detailContainer } = this.state;
    const nameCopy = name === "Piccolo S.P.A." ? "Piccolo S" : name;
    const image = images[nameCopy].default;

    return (
      <React.Fragment>
        <div className="col-8 offset-2" key={id}>
          <PreviewDetails
            name={name}
            borderBottom={borderBottom}
            image={image}
            chevronClicked={chevronClicked}
            onClickHandler={this.toggleShowDetails}
          />
        </div>
        <div
          className={`${detailContainer} faux-row-margin pl-3 pr-3 col-8 offset-2`}
        >
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
