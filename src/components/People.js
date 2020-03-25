import React from "react";
import { withRouter } from "react-router-dom";
import Table from "./reusable/Table.js";
import { PreviewDetails } from "./reusable/PreviewDetails.js";
import { AryToComponentAryTranslator } from "./reusable/AryToComponentAryTranslator.js";
import { Footer } from "./reusable/Footer.js";
import { NoContent } from "./reusable/NoContent.js";
import { Loading } from "./reusable/Loading.js";
import Head from "./reusable/Head.js";

class PeopleSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      people: [],
      filters: {},
      scrollFocus: true,
      activeFilters: {
        eye_color: {},
        films: {},
        gender: {},
        hair_color: {}
      },
      titleDropdownAry: [
        { name: "Locations", path: "/locations" },
        { name: "Species", path: "/species" },
        { name: "Films", path: "/films" }
      ]
    };
    this.toggleFilterClicked = this.toggleFilterClicked.bind(this);
    this.filterPeople = this.filterPeople.bind(this);
    this.updateSearch = this.updateSearch.bind(this);
    this.debounce = this.debounce.bind(this);
    this.unregisterScrollFocus = this.unregisterScrollFocus.bind(this);
    this.timer;
  }

  unregisterScrollFocus() {
    this.setState({
      scrollFocus: false
    });
  }

  debounce() {
    clearTimeout(this.timer);
    this.timer = setTimeout(this.filterPeople, 400);
  }

  filterPeople() {
    const { activeFilters, people, search } = this.state;
    const actFilHasGender =
      Object.values(activeFilters.gender).find(genderName => genderName) !==
      undefined;
    const actFilHasEyeColor =
      Object.values(activeFilters.eye_color).find(boxChecked => boxChecked) !==
      undefined;
    const actFilHasHairColor =
      Object.values(activeFilters.hair_color).find(boxChecked => boxChecked) !==
      undefined;
    const actFilHasFilms =
      Object.values(activeFilters.films).find(boxChecked => boxChecked) !==
      undefined;

    const filteredPeople = people.filter(person => {
      const genderIsActive = activeFilters.gender[person.gender];
      const eyeColorIsActive = activeFilters.eye_color[person.eye_color];
      const hairColorIsActive = activeFilters.hair_color[person.hair_color];
      const filmInActiveFilters = person.films.find(film => {
        return activeFilters.films[film.name];
      });

      const filmIsActive = filmInActiveFilters !== undefined;
      const nameMatchesSearch =
        person.name.toLowerCase().indexOf(search.toLowerCase()) === 0;

      return (
        (genderIsActive || !actFilHasGender) &&
        (eyeColorIsActive || !actFilHasEyeColor) &&
        (hairColorIsActive || !actFilHasHairColor) &&
        (filmIsActive || !actFilHasFilms) &&
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
      .then(([filters, people]) => {
        this.setState({
          filters,
          people,
          filteredPeople: people
        });
      })
      .catch(error => {
        console.error(error);
      });
  }

  render() {
    const { filters, search, scrollFocus, titleDropdownAry } = this.state;
    const { title, images } = this.props;
    const scrollToId = this.props.location.pathname.split("/people/")[1];
    let bodyContent;

    if (this.state.filteredPeople) {
      if (this.state.filteredPeople.length > 0) {
        bodyContent = (
          <People
            people={this.state.filteredPeople}
            images={images}
            scrollToId={scrollToId}
            scrollFocus={scrollFocus}
            unregisterScrollFocus={this.unregisterScrollFocus}
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
        />
        <div id="body-content" className="mt-5 mb-5">
          {bodyContent}
        </div>
        <Footer />
      </div>
    );
  }
}

const People = ({
  people,
  images,
  scrollToId,
  scrollFocus,
  unregisterScrollFocus
}) => {
  const personAry = Object.values(people).map(person => {
    return (
      <Person
        person={person}
        images={images}
        key={person.id}
        scrollToId={scrollToId}
        scrollFocus={scrollFocus}
        unregisterScrollFocus={unregisterScrollFocus}
      />
    );
  });

  return (
    <div className="faux-row-margin">
      <div className="col-8 offset-2 border-bottom">{personAry}</div>
    </div>
  );
};

class Person extends Table {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.scrollToRef = this.scrollToRef.bind(this);
  }

  scrollToRef() {
    window.scrollTo(0, this.myRef.current.offsetTop);
  }

  componentDidMount() {
    const { person, scrollToId, scrollFocus } = this.props;
    if (person.id === scrollToId && scrollFocus) {
      this.scrollToRef();
      this.startAnimation();
    }
  }

  componentWillUnmount() {
    this.props.unregisterScrollFocus();
  }

  render() {
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
    const { chevronClicked, borderRules, detailContainer } = this.state;
    const image = this.props.images[name.toLowerCase()].default;

    return (
      <div ref={this.myRef}>
        <div id={id}>
          <PreviewDetails
            name={name}
            borderRules={borderRules}
            image={image}
            chevronClicked={chevronClicked}
            onClickHandler={this.toggleShowDetails}
          />
          <div className={`${detailContainer} faux-row-margin pl-3 pr-3`}>
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
        </div>
      </div>
    );
  }
}

export const SearchPageWithRouter = withRouter(PeopleSearch);
