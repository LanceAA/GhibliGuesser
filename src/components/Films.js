import React from "react";
import { Header } from "./reusable/Header.js";
import { Searchbar } from "./reusable/Searchbar.js";
import Filter from "./reusable/Filter.js";
import { PreviewDetails } from "./reusable/PreviewDetails.js";
import { CharacterThumbnails } from "./reusable/CharacterThumbnails.js";
import { Footer } from "./reusable/Footer.js";
import { NoContent } from "./reusable/NoContent.js";

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
    this.filterFilms = this.filterFilms.bind(this);
    this.debounce = this.debounce.bind(this);
    this.timer;
  }

  debounce() {
    clearTimeout(this.timer);
    this.timer = setTimeout(this.filterFilms, 400);
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
        this.debounce
      );
    } else if (target.placeholder === "Max") {
      this.setState(
        {
          maxRange: target.value
        },
        this.debounce
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
    const { search, filters, filteredFilms, minRange, maxRange } = this.state;
    const { images, title, peopleImages } = this.props;
    console.log(this.state);

    const table =
      filteredFilms.length > 0 ? (
        <Films
          images={images}
          films={filteredFilms}
          peopleImages={peopleImages}
        />
      ) : (
        <NoContent />
      );

    return (
      <div id="master-container" className="container-fluid">
        <div id="header">
          <Header title={title} />
          <Searchbar search={search} onChangeHandler={this.updateSearch} />
          <Filter
            filters={filters}
            toggleFilterClicked={this.toggleFilterClicked}
          >
            <div className="col">
              <p className="theme-dark-color">Release Year:</p>
              <div className="mb-3 theme-dark-color">
                <p>From</p>
                <input
                  id="min-input"
                  className="form-control"
                  type="number"
                  placeholder="Min"
                  value={minRange}
                  onChange={this.updateRange}
                />
              </div>
              <div className="mb-3 theme-dark-color">
                <p>To</p>
                <input
                  id="max-input"
                  className="form-control"
                  type="number"
                  placeholder="Max"
                  value={maxRange}
                  onChange={this.updateRange}
                />
              </div>
            </div>
          </Filter>
        </div>
        <div id="body-content" className="mt-5 mb-5">
          {table}
        </div>
        <Footer />
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

  return <div className="faux-row-margin">{filmAry}</div>;
};

class Film extends React.Component {
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
      description,
      director,
      producer,
      release_date,
      rt_score,
      title,
      people,
      id
    } = this.props.film;
    const { chevronClicked, borderBottom, detailContainer } = this.state;
    const image = images[title].default;

    return (
      <React.Fragment>
        <div className="col-8 offset-2" key={id}>
          <PreviewDetails
            name={title}
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
              <h5 className="underline">Description</h5>
              <p>{description}</p>
            </div>
          </div>
          <div className="row mb-2">
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
          <div className="row mb-2">
            <div className="col">
              <h5 className="underline">People</h5>
              <CharacterThumbnails people={people} images={peopleImages} />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
