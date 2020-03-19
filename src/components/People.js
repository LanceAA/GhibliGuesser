import React from "react";
import { withRouter } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.css";
import Filter from "./reusable/Filter.js";
import { Header } from "./reusable/Header.js";
import { Searchbar } from "./reusable/Searchbar.js";
import { PreviewDetails } from "./reusable/PreviewDetails.js";
import { AryToComponentAryTranslator } from "./reusable/AryToComponentAryTranslator.js";
import { Footer } from "./reusable/Footer.js";
import { NoContent } from "./reusable/NoContent.js";

class PeopleSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
    this.debounce = this.debounce.bind(this);
    this.timer;
  }

  debounce() {
    clearTimeout(this.timer);
    this.timer = setTimeout(this.filterPeople, 400);
  }

  filterPeople() {
    const activeFilters = this.state.activeFilters;
    const hasActiveGender =
      Object.values(activeFilters.gender).find(genderName => genderName) !==
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
      this.filterPeople
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
          people[index].age =
            people[index].age === "" ? "Unknown" : people[index].age;

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
    const { filters, search, filteredPeople } = this.state;
    const { title, images } = this.props;

    const table =
      filteredPeople.length > 0 ? (
        <People people={filteredPeople} images={images} />
      ) : (
        <NoContent />
      );

    return (
      <div className="container-fluid">
        <div id="head">
          <Header title={title} />
          <Searchbar onChangeHandler={this.updateSearch} search={search} />
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

const People = ({ people, images }) => {
  const personAry = Object.values(people).map(person => {
    return <Person person={person} images={images} key={person.id} />;
  });

  return <div className="faux-row-margin">{personAry}</div>;
};

class Person extends React.Component {
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
    const { chevronClicked, borderBottom, detailContainer } = this.state;
    const image = this.props.images[name.toLowerCase()].default;

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
          <div className="row">
            <div className="col">
              <h5 className="underline">Age</h5>
              <p>{age}</p>
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
      </React.Fragment>
    );
  }
}

export const SearchPageWithRouter = withRouter(PeopleSearch);
