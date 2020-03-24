import React from "react";
import Table from "./reusable/Table.js";
import { PreviewDetails } from "./reusable/PreviewDetails.js";
import { CharacterThumbnails } from "./reusable/CharacterThumbnails.js";
import { AryToComponentAryTranslator } from "./reusable/AryToComponentAryTranslator.js";
import { Footer } from "./reusable/Footer.js";
import { NoContent } from "./reusable/NoContent.js";
import { Loading } from "./reusable/Loading.js";
import Head from "./reusable/Head.js";
import girl from "../assets/girl.png";

export default class SpeciesSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      species: [],
      filters: {},
      activeFilters: {
        hair_colors: {},
        eye_colors: {}
      }
    };
    this.updateSearch = this.updateSearch.bind(this);
    this.toggleFilterClicked = this.toggleFilterClicked.bind(this);
    this.filterSpecies = this.filterSpecies.bind(this);
    this.matchesActiveFilter = this.matchesActiveFilter.bind(this);
    this.debounce = this.debounce.bind(this);
    this.timer;
  }

  debounce() {
    clearTimeout(this.timer);
    this.timer = setTimeout(this.filterSpecies, 1000);
  }

  matchesActiveFilter(ary, category) {
    return (
      ary.find(item => {
        return this.state.activeFilters[category][item];
      }) !== undefined
    );
  }

  filterSpecies() {
    const activeFilters = this.state.activeFilters;
    const actFilHasEyeColors =
      Object.values(activeFilters.eye_colors).find(
        eyeColorName => eyeColorName
      ) !== undefined;
    const actFilHasHairColors =
      Object.values(activeFilters.hair_colors).find(
        hairColorName => hairColorName
      ) !== undefined;

    const filteredSpecies = this.state.species.filter(spec => {
      const eyeColors = spec.eye_colors.split(", ");
      const hairColors = spec.hair_colors.split(", ");

      const nameMatchesSearch =
        spec.name.toLowerCase().indexOf(this.state.search.toLowerCase()) === 0;

      return (
        (this.matchesActiveFilter(eyeColors, "eye_colors") ||
          !actFilHasEyeColors) &&
        (this.matchesActiveFilter(hairColors, "hair_colors") ||
          !actFilHasHairColors) &&
        (nameMatchesSearch || this.state.search === "")
      );
    });

    this.setState({
      filteredSpecies
    });
  }

  updateSearch({ target }) {
    this.setState(
      {
        search: target.value
      },
      this.debounce
    );
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
      this.filterSpecies
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
        const peopleById = {};

        films.forEach(film => {
          filmsById[film.id] = film;
        });

        people.forEach(person => {
          peopleById[person.id] = person;
        });

        const filters = species.reduce(
          (acc, curr) => {
            const fields = Object.keys(acc);
            fields.forEach(field => {
              const separated = curr[field].split(", ");
              separated.forEach(item => {
                acc[field].list.add(item);
              });
            });
            return acc;
          },
          {
            eye_colors: { list: new Set(), title: "Eye Color" },
            hair_colors: { list: new Set(), title: "Hair Color" }
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

        species.forEach((spec, index) => {
          spec.people.forEach((person, i) => {
            const personId = person.split("/people/")[1];
            if (personId !== "") {
              species[index].people[i] = {
                name: peopleById[personId].name,
                id: personId
              };
            } else {
              species[index].people = [];
            }
          });
          spec.films.forEach((film, i) => {
            const filmId = film.split("/films/")[1];
            if (filmId !== "") {
              species[index].films[i] = {
                name: filmsById[filmId].title,
                id: filmId
              };
            } else {
              species[index].films = [];
            }
          });
        });

        return Promise.all([filters, species]);
      })
      .then(([filters, species]) => {
        this.setState({
          filters,
          species,
          filteredSpecies: species
        });
      });
  }

  render() {
    console.log(this.state);
    const { search, filters } = this.state;
    const { images, peopleImages, title } = this.props;
    let bodyContent;

    if (this.state.filteredSpecies) {
      if (this.state.filteredSpecies.length > 0) {
        bodyContent = (
          <Species
            images={images}
            species={this.state.filteredSpecies}
            peopleImages={peopleImages}
          />
        );
      } else {
        bodyContent = <NoContent />;
      }
    } else {
      bodyContent = <Loading />;
    }

    //bodyContent = <Loading />;

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

const Species = ({ species, images, peopleImages }) => {
  const speciesAry = Object.values(species).map(species => {
    return (
      <SpeciesSingular
        species={species}
        images={images}
        key={species.id}
        peopleImages={peopleImages}
      />
    );
  });

  return (
    <div className="faux-row-margin">
      <div className="col-8 offset-2 border-bottom">{speciesAry}</div>
    </div>
  );
};

class SpeciesSingular extends Table {
  constructor(props) {
    super(props);
  }

  render() {
    console.log(this.props);
    const { images, peopleImages } = this.props;
    const {
      name,
      classification,
      eye_colors,
      hair_colors,
      people,
      films,
      id
    } = this.props.species;
    const { chevronClicked, borderRules, detailContainer } = this.state;
    const image = images[name].default;

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
              <h5 className="underline">Name</h5>
              <p>{name}</p>
            </div>
            <div className="col">
              <h5 className="underline">Classification</h5>
              <p>{classification}</p>
            </div>
            <div className="col">
              <h5 className="underline">Eye Colors</h5>
              <p>{eye_colors}</p>
            </div>
            <div className="col">
              <h5 className="underline">Hair Colors</h5>
              <p>{hair_colors}</p>
            </div>
          </div>
          <div className="row mb-4">
            <div className="col">
              <h5 className="underline">People</h5>
              <CharacterThumbnails people={people} images={peopleImages} />
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
