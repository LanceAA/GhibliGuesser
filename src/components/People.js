import React from "react";
import { withRouter } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.css";
import Filter from "./reusable/Filter.js";
import { Header } from "./reusable/Header.js";
import { Searchbar } from "./reusable/Searchbar.js";

class PeopleSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: this.props.title,
      images: this.props.images,
      search: "",
      people: [],
      filteredPeople: [],
      filters: {},
      activeFilters: {
        eye_color: {},
        films: {},
        gender: {},
        hair_color: {}
      }
    };
    this.test = this.test.bind(this);
    this.toggleFilterClicked = this.toggleFilterClicked.bind(this);
    this.filterPeople = this.filterPeople.bind(this);
    this.updateSearch = this.updateSearch.bind(this);
  }

  filterPeople() {
    const activeFilters = this.state.activeFilters;
    const hasActiveGender =
      Object.values(activeFilters.gender).find(boxChecked => boxChecked) !==
      undefined;
    const hasActiveEyeColor =
      Object.values(activeFilters.eye_color).find(boxChecked => boxChecked) !==
      undefined;
    const hasActiveHairColor =
      Object.values(activeFilters.hair_color).find(boxChecked => boxChecked) !==
      undefined;
    const hasActiveFilms =
      Object.values(activeFilters.films).find(boxChecked => boxChecked) !==
      undefined;

    const filteredPeople = this.state.people.filter(person => {
      const filmInActiveFilters = person.films.find(film => {
        return activeFilters.films[film.name];
      });

      const hasFilmMatch = filmInActiveFilters !== undefined;
      const nameMatchesSearch =
        person.name.toLowerCase().indexOf(this.state.search.toLowerCase()) ===
        0;

      return (
        (activeFilters.gender[person.gender] || !hasActiveGender) &&
        (activeFilters.eye_color[person.eye_color] || !hasActiveEyeColor) &&
        (activeFilters.hair_color[person.hair_color] || !hasActiveHairColor) &&
        (hasFilmMatch || !hasActiveFilms) &&
        (nameMatchesSearch || this.state.search === "")
      );
    });

    this.setState({
      filteredPeople
    });
  }

  toggleFilterClicked(category, option, filmId) {
    console.log("in togglefilter");
    let activeFilters = { ...this.state.activeFilters[category] };

    //const field = category !== "films" ? option : filmId;

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
      this.filterPeople
    );
  }

  updateSearch({ target }) {
    console.log(target.value);
    this.setState(
      {
        search: target.value
      },
      this.filterPeople
    );
  }

  componentWillUnmount() {
    console.log("unmounting");
  }

  componentDidMount() {
    Promise.all([
      fetch("https://ghibliapi.herokuapp.com/people"),
      fetch("https://ghibliapi.herokuapp.com/films"),
      fetch("https://ghibliapi.herokuapp.com/species")
    ])
      .then(([people, films, species]) => {
        return Promise.all([people.json(), films.json(), species.json()]);
      })
      .then(([people, films, species]) => {
        const filmsById = {};
        const speciesById = {};

        films.forEach(film => {
          filmsById[film.id] = film;
        });

        species.forEach(species => {
          speciesById[species.id] = species;
        });

        const filters = people.reduce(
          (acc, curr) => {
            const fields = Object.keys(acc);
            fields.forEach(field => {
              if (field === "films") {
                curr[field].forEach(film => {
                  const filmId = film.split("/films/")[1];
                  acc[field].list.add(filmsById[filmId].title);
                });
              } else {
                acc[field].list.add(curr[field]);
              }
            });
            return acc;
          },
          {
            gender: { list: new Set(), title: "Gender" },
            eye_color: { list: new Set(), title: "Eye Color" },
            hair_color: { list: new Set(), title: "Hair Color" },
            films: { list: new Set(), title: "Films" }
          }
        );

        people.forEach((person, index) => {
          const speciesId = person.species.split("/species/")[1];
          people[index].species = speciesById[speciesId].name;

          person.films.forEach((film, i) => {
            const filmId = film.split("/films/")[1];
            people[index].films[i] = {
              name: filmsById[filmId].title,
              id: filmId
            };
          });
        });

        Object.entries(filters).forEach(([category, obj]) => {
          filters[category].list = [...obj.list].map(option => {
            const rng = Math.floor(Math.random() * 100000000000);
            return {
              name: option,
              id: rng
            };
          });
        });

        return Promise.all([filters, people]);
      })
      .then(([filters, people]) =>
        this.setState({
          filters,
          people,
          filteredPeople: people
        })
      )
      .catch(error => {
        console.error(error);
      });
  }

  test() {
    console.log("hey");
  }

  render() {
    console.log(this.state);
    const { filters, title, search, filteredPeople, images } = this.state;
    return (
      <div className="container-fluid">
        <Header title={title} />
        <Searchbar onChangeHandler={this.updateSearch} search={search} />
        <Filter
          filters={filters}
          toggleFilterClicked={this.toggleFilterClicked}
        />
        <div className="row mt-5">
          <People people={filteredPeople} images={images} />
        </div>
      </div>
    );
  }
}

const People = props => {
  return Object.values(props.people).map(person => {
    const { images } = props;
    return <Person person={person} images={images} key={person.id} />;
  });
};

class Person extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDetails: false
    };
    this.toggleShowDetails = this.toggleShowDetails.bind(this);
  }

  toggleShowDetails() {
    this.setState({
      showDetails: !this.state.showDetails
    });
  }

  render() {
    console.log(this.props);
    const { images } = this.props;
    const {
      name,
      id,
      age,
      eye_color,
      hair_color,
      films,
      species,
      gender
    } = this.props.person;
    let dropdownStatus;
    let chevronClicked;
    let borderBottom;
    let borderTop;
    const nameLowerCase = name.toLowerCase();
    const determinedAge = age !== "" ? age : "Unavailable";

    if (this.state.showDetails) {
      dropdownStatus = "";
      chevronClicked = "fa-chevron-up";
      borderBottom = "border-bottom-0";
      borderTop = "border-top-0";
    } else {
      dropdownStatus = "d-none";
      chevronClicked = "fa-chevron-down";
      borderBottom = "";
      borderTop = "";
    }
    return (
      <div className="col-8 offset-2" key={id}>
        <div
          className={`${borderBottom} row border pt-2 pb-2 align-items-center`}
        >
          <div className="col-1">
            <img className="people-thumb" src={images[nameLowerCase].default} />
          </div>
          <div className="col-8 offset-1 text-center">
            <p className="people-title">{name}</p>
          </div>
          <div className="col-1 offset-1">
            <i
              className={`fas ${chevronClicked} people-chevron cursor-pointer-on-hover`}
              expandkey={id}
              onClick={this.toggleShowDetails}
            ></i>
          </div>
        </div>
        <div className={`row ${dropdownStatus + borderTop} border pt-4`}>
          <div className="col">
            <h5 className="underline">Age</h5>
            <p>{determinedAge}</p>
          </div>
          <div className="col">
            <h5 className="underline">Eye Color</h5>
            <p>{eye_color}</p>
          </div>
          <div className="col">
            <h5 className="underline">Hair Color</h5>
            <p>{hair_color}</p>
          </div>
          <div className="col">
            <h5 className="underline">Species</h5>
            <p>{species}</p>
          </div>
          <div className="col">
            <h5 className="underline">Films</h5>
            <AryToComponentAryTranslator ary={films} />
          </div>
          <div className="col">
            <h5 className="underline">Gender</h5>
            <p>{gender}</p>
          </div>
        </div>
      </div>
    );
  }
}

const AryToComponentAryTranslator = ({ ary }) => {
  return ary.map(({ name, id }) => {
    return <p key={id}>{name}</p>;
  });
};

export const SearchPageWithRouter = withRouter(PeopleSearch);
