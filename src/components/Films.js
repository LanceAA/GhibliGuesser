import React from "react";
import Table from "./reusable/Table.js";
import { PreviewDetails } from "./reusable/PreviewDetails.js";
import { CharacterThumbnails } from "./reusable/CharacterThumbnails.js";
import { Footer } from "./reusable/Footer.js";
import { NoContent } from "./reusable/NoContent.js";
import { Loading } from "./reusable/Loading.js";
import Head from "./reusable/Head.js";

export default class FilmSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      films: [],
      filters: {},
      activeFilters: {
        director: {},
        producer: {}
      },
      minRange: "",
      maxRange: "",
      titleDropdownAry: [
        { name: "People", path: "/people" },
        { name: "Locations", path: "/locations" },
        { name: "Species", path: "/species" }
      ]
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
    const actFilHasDirector =
      Object.values(activeFilters.director).find(
        directorName => directorName
      ) !== undefined;
    const actFilHasProducer =
      Object.values(activeFilters.producer).find(
        producerName => producerName
      ) !== undefined;

    const filteredFilms = this.state.films.filter(film => {
      const directorIsActive = activeFilters.director[film.director];
      const producerIsActive = activeFilters.producer[film.producer];
      const releaseYear = Number(film.release_date);
      const withinRange = minRange <= releaseYear && releaseYear <= maxRange;
      const nameMatchesSearch =
        film.title.toLowerCase().indexOf(this.state.search.toLowerCase()) === 0;

      return (
        (directorIsActive || !actFilHasDirector) &&
        (producerIsActive || !actFilHasProducer) &&
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
    const {
      search,
      filters,
      minRange,
      maxRange,
      titleDropdownAry
    } = this.state;
    const { images, title, peopleImages } = this.props;
    let bodyContent;

    if (this.state.filteredFilms) {
      if (this.state.filteredFilms.length > 0) {
        bodyContent = (
          <Films
            images={images}
            films={this.state.filteredFilms}
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
          titleDropdownAry={titleDropdownAry}
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
        </Head>
        <div id="body-content" className="mt-5 mb-5">
          {bodyContent}
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

  return (
    <div className="faux-row-margin">
      <div className="col-8 offset-2 border-bottom">{filmAry}</div>
    </div>
  );
};

class Film extends Table {
  constructor(props) {
    super(props);
  }

  render() {
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
    const { chevronClicked, borderRules, detailContainer } = this.state;
    const image = images[title].default;

    return (
      <React.Fragment>
        <PreviewDetails
          name={title}
          borderRules={borderRules}
          image={image}
          chevronClicked={chevronClicked}
          onClickHandler={this.toggleShowDetails}
        />
        <div className={`${detailContainer} faux-row-margin pl-3 pr-3`}>
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
