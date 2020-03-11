import React from "react";
import { Header } from "./reusable/Header.js";
import { Searchbar } from "./reusable/Searchbar.js";

export default class Films extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: this.props.title,
      search: "",
      films: [],
      filteredFilms: [],
      filters: {},
      activeFilters: {
        director: {},
        producer: {}
      }
    };
    this.updateSearch = this.updateSearch.bind(this);
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

        console.log(peopleById);

        films.forEach((film, index) => {
          film.people.forEach((person, i) => {
            const personId = person.split("/people/")[1];
            if (personId !== "") {
              films[index].people[i] = {
                name: peopleById[personId].name,
                id: personId
              };
            } else {
              films[index].people = "";
            }
          });
        });

        console.log(filters);
        console.log(films);

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
    const { search, title } = this.state;
    console.log(this.state);
    return (
      <div className="container-fluid">
        <Header title={title} />
        <Searchbar search={search} onChangeHandler={this.updateSearch} />
      </div>
    );
  }
}
