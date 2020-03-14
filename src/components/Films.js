import React from "react";
import { Header } from "./reusable/Header.js";
import { Searchbar } from "./reusable/Searchbar.js";
import Filter from "./reusable/Filter.js";
import { PreviewDetails } from "./reusable/PreviewDetails.js";
import { CharacterThumbnails } from "./reusable/CharacterThumbnails.js";

export default class FilmSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      films: [],
      filteredFilms: [],
      filters: {},
      activeFilters: {
        director: {},
        producer: {}
      },
      minRange: "",
      maxRange: ""
    };
    this.updateSearch = this.updateSearch.bind(this);
    this.toggleFilterClicked = this.toggleFilterClicked.bind(this);
    this.updateRange = this.updateRange.bind(this);
  }

  filterFilms() {
    const activeFilters = this.state.activeFilters;
    const maxRange =
      this.state.maxRange !== ""
        ? Number(this.state.maxRange)
        : Number.MAX_VALUE;
    const minRange = Number(this.state.minRange);
    const hasActiveDirector =
      Object.values(activeFilters.director).find(
        directorName => directorName
      ) !== undefined;
    const hasActiveProducer =
      Object.values(activeFilters.producer).find(
        producerName => producerName
      ) !== undefined;

    const filteredFilms = this.state.films.filter(film => {
      const releaseYear = +film.release_date;
      const withinRange = minRange <= releaseYear && releaseYear <= maxRange;
      const nameMatchesSearch =
        film.title.toLowerCase().indexOf(this.state.search.toLowerCase()) === 0;

      return (
        (activeFilters.director[film.director] || !hasActiveDirector) &&
        (activeFilters.producer[film.producer] || !hasActiveProducer) &&
        (nameMatchesSearch || this.state.search === "") &&
        withinRange
      );
    });

    this.setState({
      filteredFilms
    });
  }

  updateRange({ target }) {
    if (target.placeholder === "Min") {
      this.setState(
        {
          minRange: target.value
        },
        this.filterFilms
      );
    } else if (target.placeholder === "Max") {
      this.setState(
        {
          maxRange: target.value
        },
        this.filterFilms
      );
    } else {
      console.error("Incorrect element hit updateRange");
    }
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
      this.filterFilms
    );
  }

  updateSearch({ target }) {
    console.log(target.value);
    this.setState(
      {
        search: target.value
      },
      this.filterFilms
    );
  }

  componentDidMount() {
    Promise.all([
      fetch("https://ghibliapi.herokuapp.com/people"),
      fetch("https://ghibliapi.herokuapp.com/films")
    ])
      .then(([people, films]) => {
        return Promise.all([people.json(), films.json()]);
      })
      .then(([people, films]) => {
        const filmsById = {};
        const peopleById = {};

        films.forEach(film => {
          filmsById[film.id] = film;
        });

        people.forEach(person => {
          peopleById[person.id] = person;
        });

        const filters = films.reduce(
          (acc, curr) => {
            const fields = Object.keys(acc);
            fields.forEach(field => {
              acc[field].list.add(curr[field]);
            });
            return acc;
          },
          {
            director: { list: new Set(), title: "Director" },
            producer: { list: new Set(), title: "Producer" }
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

        films.forEach((film, index) => {
          film.people.forEach((person, i) => {
            const personId = person.split("/people/")[1];
            if (personId !== "") {
              films[index].people[i] = {
                name: peopleById[personId].name,
                id: personId
              };
            } else {
              films[index].people = [];
            }
          });
        });

        return Promise.all([filters, films]);
      })
      .then(([filters, films]) => {
        this.setState({
          filters,
          films,
          filteredFilms: films
        });
      });
  }

  render() {
    const { search, filters, filteredFilms } = this.state;
    const { images, title, peopleImages } = this.props;
    console.log(this.state);
    return (
      <div className="container-fluid">
        <Header title={title} />
        <Searchbar search={search} onChangeHandler={this.updateSearch} />
        <Filter
          filters={filters}
          toggleFilterClicked={this.toggleFilterClicked}
          onChange={this.updateRange}
        />
        <Films
          images={images}
          films={filteredFilms}
          peopleImages={peopleImages}
        />
      </div>
    );
  }
}

const Films = ({ films, images, peopleImages }) => {
  const filmAry = Object.values(films).map(film => {
    return (
      <Film
        film={film}
        images={images}
        key={film.id}
        peopleImages={peopleImages}
      />
    );
  });

  return <div className="row mt-5">{filmAry}</div>;
};

class Film extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDetails: false,
      dropdownStatus: "d-none",
      chevronClicked: "fa-chevron-down",
      borderBottom: "",
      borderTop: ""
    };
    this.toggleShowDetails = this.toggleShowDetails.bind(this);
  }

  toggleShowDetails() {
    if (this.state.showDetails) {
      this.setState({
        showDetails: false,
        dropdownStatus: "d-none",
        chevronClicked: "fa-chevron-down",
        borderBottom: "",
        borderTop: ""
      });
    } else {
      this.setState({
        showDetails: true,
        dropdownStatus: "",
        chevronClicked: "fa-chevron-up",
        borderBottom: "border-bottom-0",
        borderTop: "border-top-0"
      });
    }
  }

  render() {
    console.log(this.props);
    const { images, peopleImages } = this.props;
    const {
      description,
      director,
      producer,
      release_date,
      rt_score,
      title,
      people,
      id
    } = this.props.film;
    const {
      dropdownStatus,
      chevronClicked,
      borderBottom,
      borderTop
    } = this.state;
    const image = images[title].default;

    return (
      <div className="col-8 offset-2" key={id}>
        <PreviewDetails
          name={title}
          borderBottom={borderBottom}
          image={image}
          chevronClicked={chevronClicked}
          onClickHandler={this.toggleShowDetails}
        />
        <div
          className={`row ${dropdownStatus + borderTop} border pt-4 pl-3 pr-3`}
        >
          <div className="col">
            <div className="row">
              <div className="col mb-2">
                <h5 className="underline">Description</h5>
                <p>{description}</p>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="row w-100 mb-2">
              <div className="col">
                <h5 className="underline">Director</h5>
                <p>{director}</p>
              </div>
              <div className="col">
                <h5 className="underline">Producer</h5>
                <p>{producer}</p>
              </div>
              <div className="col">
                <h5 className="underline">Release Date</h5>
                <p>{release_date}</p>
              </div>
              <div className="col">
                <h5 className="underline">Score</h5>
                <p>{rt_score}</p>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="row">
              <div className="col">
                <h5 className="underline">People</h5>
                <CharacterThumbnails people={people} images={peopleImages} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
